export interface Snack {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: ReturnType<typeof setTimeout>;
}
