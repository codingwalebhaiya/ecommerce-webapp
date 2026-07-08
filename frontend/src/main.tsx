import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from "@/redux/store"
import { Toaster } from "@/components/ui/sonner"


const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(

  <>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster position='top-right' richColors />
    </Provider>
  </>
)
