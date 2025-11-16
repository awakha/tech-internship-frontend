import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

const initialUI = {
  theme: (localStorage.getItem('theme') as ThemeMode) || 'light',
  selectedAds: [] as number[]
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUI,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme(state) {
      const next = state.theme === 'light' ? 'dark' : 'light';
      state.theme = next;
      localStorage.setItem('theme', next);
    },
    selectAd(state, action: PayloadAction<number>) {
      if (!state.selectedAds.includes(action.payload)) state.selectedAds.push(action.payload);
    },
    deselectAd(state, action: PayloadAction<number>) {
      state.selectedAds = state.selectedAds.filter(id => id !== action.payload);
    },
    clearSelection(state) {
      state.selectedAds = [];
    },
    setSelection(state, action: PayloadAction<number[]>) {
      state.selectedAds = action.payload;
    }
  }
});

export const { setTheme, toggleTheme, selectAd, deselectAd, clearSelection, setSelection } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer
  }
});

// inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;