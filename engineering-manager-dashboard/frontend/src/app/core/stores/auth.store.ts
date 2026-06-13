import { computed, inject } from '@angular/core';
import { signalStore, patchState, withState, withMethods, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthUser, LoginRequest } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'emd_access_token';
const USER_KEY = 'emd_user';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: loadStoredUser(),
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, accessToken }) => ({
    isAuthenticated: computed(() => !!accessToken() && !!user()),
    role: computed(() => user()?.role ?? null),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    login: rxMethod<LoginRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((credentials) =>
          authService.login(credentials).pipe(
            tap(({ accessToken, user }) => {
              localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
              localStorage.setItem(USER_KEY, JSON.stringify(user));
              patchState(store, { user, accessToken, isLoading: false, error: null });
            }),
            catchError(() => {
              patchState(store, { isLoading: false, error: 'Invalid email or password' });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
    refreshProfile: rxMethod<void>(
      pipe(
        switchMap(() =>
          authService.getProfile().pipe(
            tap((user) => {
              localStorage.setItem(USER_KEY, JSON.stringify(user));
              patchState(store, { user });
            }),
            catchError(() => of(null)),
          ),
        ),
      ),
    ),
    logout(): void {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      patchState(store, { user: null, accessToken: null, error: null });
    },
  })),
);
