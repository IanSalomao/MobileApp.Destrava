import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';

import { useMyProfile } from '@/features/profile/hooks';

import { DEFAULT_PAGE_SIZE, searchTeachers } from './api';
import {
  countActiveFilters,
  escalateTeachersByNeighborhood,
  extractAvailableNeighborhoods,
} from './domain/neighborhood-escalation';
import {
  DEFAULT_SEARCH_FILTERS,
  DEFAULT_SEARCH_LOCATION,
  type BrazilianState,
  type SearchTeachersParams,
  type TeacherSearchFilters,
  type TeacherSearchLocation,
} from './types';

const STORAGE_KEY = 'destrava:guardian-search-location:v1';

function loadPersistedLocation(): TeacherSearchLocation | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TeacherSearchLocation>;
        if (parsed.cityId && parsed.cityName && parsed.state) {
          return {
            cityId: parsed.cityId,
            cityName: parsed.cityName,
            state: parsed.state,
            neighborhoods: Array.isArray(parsed.neighborhoods) ? parsed.neighborhoods : [],
          };
        }
      }
    }
  } catch {
    // Ignora erro de leitura de storage
  }
  return null;
}

function savePersistedLocation(location: TeacherSearchLocation) {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(location));
    }
  } catch {
    // Ignora erro de escrita de storage
  }
}

type SearchStoreState = {
  location: TeacherSearchLocation;
  filters: TeacherSearchFilters;
  hydratedFromProfileUid: string | null;
};

let storeState: SearchStoreState = {
  location: loadPersistedLocation() ?? DEFAULT_SEARCH_LOCATION,
  filters: DEFAULT_SEARCH_FILTERS,
  hydratedFromProfileUid: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const teacherSearchStore = {
  getState(): SearchStoreState {
    return storeState;
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setLocation(location: Partial<TeacherSearchLocation>) {
    const cityChanged =
      (location.cityId !== undefined && location.cityId !== storeState.location.cityId) ||
      (location.state !== undefined && location.state !== storeState.location.state);

    const nextLocation: TeacherSearchLocation = {
      ...storeState.location,
      ...location,
      neighborhoods:
        location.neighborhoods !== undefined
          ? location.neighborhoods
          : cityChanged
            ? []
            : storeState.location.neighborhoods,
    };

    storeState = {
      ...storeState,
      location: nextLocation,
    };
    savePersistedLocation(nextLocation);
    emitChange();
  },
  setFilters(filters: Partial<TeacherSearchFilters>) {
    storeState = {
      ...storeState,
      filters: {
        ...storeState.filters,
        ...filters,
      },
    };
    emitChange();
  },
  resetFilters() {
    const nextLocation: TeacherSearchLocation = {
      ...storeState.location,
      neighborhoods: [],
    };
    storeState = {
      ...storeState,
      location: nextLocation,
      filters: DEFAULT_SEARCH_FILTERS,
    };
    savePersistedLocation(nextLocation);
    emitChange();
  },
  markProfileHydrated(uid: string) {
    storeState = {
      ...storeState,
      hydratedFromProfileUid: uid,
    };
  },
};

export function useTeacherSearchState() {
  const state = useSyncExternalStore(
    teacherSearchStore.subscribe,
    teacherSearchStore.getState,
    teacherSearchStore.getState,
  );

  const profileQuery = useMyProfile();

  // Se o perfil do responsável no banco trouxer cidade/estado (ou metadados), sincroniza na 1ª vez
  useEffect(() => {
    const profile = profileQuery.data as
      (Record<string, unknown> & { id?: string }) | null | undefined;

    if (!profile?.id || state.hydratedFromProfileUid === profile.id) {
      return;
    }

    teacherSearchStore.markProfileHydrated(profile.id);

    // Só sobrescreve se o usuário ainda não tiver salvo uma escolha manual no aparelho
    if (loadPersistedLocation()) {
      return;
    }

    const profileCityId = typeof profile.city_id === 'number' ? profile.city_id : null;
    const profileCityName =
      typeof profile.city_name === 'string'
        ? profile.city_name
        : typeof profile.city === 'string'
          ? profile.city
          : null;
    const profileState =
      typeof profile.state === 'string' ? (profile.state as BrazilianState) : null;

    if (profileCityId && profileCityName && profileState) {
      teacherSearchStore.setLocation({
        cityId: profileCityId,
        cityName: profileCityName,
        state: profileState,
      });
    }
  }, [profileQuery.data, state.hydratedFromProfileUid]);

  return {
    location: state.location,
    filters: state.filters,
    activeFilterCount: countActiveFilters({
      ...state.filters,
      neighborhoods: state.location.neighborhoods,
    }),
    setLocation: teacherSearchStore.setLocation,
    setFilters: teacherSearchStore.setFilters,
    resetFilters: teacherSearchStore.resetFilters,
  };
}

export const teacherSearchKeys = {
  all: ['teacher-search'] as const,
  list: (params: SearchTeachersParams) => ['teacher-search', 'list', params] as const,
  infinite: (params: Omit<SearchTeachersParams, 'limit' | 'offset'>) =>
    ['teacher-search', 'infinite', params] as const,
  cityNeighborhoods: (cityId: number, state: BrazilianState) =>
    ['teacher-search', 'neighborhoods', state, cityId] as const,
};

export function useAvailableNeighborhoods(cityId: number, state: BrazilianState) {
  return useQuery({
    queryKey: teacherSearchKeys.cityNeighborhoods(cityId, state),
    enabled: Boolean(cityId && state),
    queryFn: async () => {
      const rows = await searchTeachers({
        cityId,
        state,
        limit: 50,
        offset: 0,
      });
      return extractAvailableNeighborhoods(rows);
    },
  });
}

export function useHomeTeachers() {
  const { location } = useTeacherSearchState();

  const query = useQuery({
    queryKey: teacherSearchKeys.list({
      cityId: location.cityId,
      state: location.state,
      limit: DEFAULT_PAGE_SIZE,
      offset: 0,
    }),
    queryFn: () =>
      searchTeachers({
        cityId: location.cityId,
        state: location.state,
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
      }),
  });

  const teachers = query.data
    ? escalateTeachersByNeighborhood(query.data, location.neighborhoods, 'prioritize')
    : [];

  const availableNeighborhoods = query.data ? extractAvailableNeighborhoods(query.data) : [];

  return {
    ...query,
    teachers,
    availableNeighborhoods,
  };
}

export function useInfiniteTeacherSearch() {
  const { location, filters } = useTeacherSearchState();

  const baseParams: Omit<SearchTeachersParams, 'limit' | 'offset'> = {
    cityId: location.cityId,
    state: location.state,
    query: filters.query,
    subjectIds: filters.subjectIds,
    languageIds: filters.languageIds,
    tutoringTypes: filters.tutoringTypes,
    minHourlyRateCents: filters.minHourlyRateCents,
    maxHourlyRateCents: filters.maxHourlyRateCents,
    weekdays: filters.weekdays,
  };

  const infiniteQuery = useInfiniteQuery({
    queryKey: teacherSearchKeys.infinite(baseParams),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchTeachers({
        ...baseParams,
        limit: DEFAULT_PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < DEFAULT_PAGE_SIZE) {
        return undefined;
      }
      const loadedCount = allPages.reduce((sum, page) => sum + page.length, 0);
      const totalCount = Number(lastPage[0]?.total_count ?? 0);
      if (totalCount > 0 && loadedCount >= totalCount) {
        return undefined;
      }
      return loadedCount;
    },
  });

  const rawTeachers = infiniteQuery.data ? infiniteQuery.data.pages.flat() : [];

  const teachers = escalateTeachersByNeighborhood(
    rawTeachers,
    location.neighborhoods,
    filters.neighborhoodMode,
  );

  const totalCount =
    filters.neighborhoodMode === 'strict' && location.neighborhoods.length > 0
      ? teachers.length
      : Number(rawTeachers[0]?.total_count ?? teachers.length);

  return {
    ...infiniteQuery,
    teachers,
    totalCount,
  };
}
