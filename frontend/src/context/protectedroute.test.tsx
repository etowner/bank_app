import { useUserContext } from './UserContext';
import ProtectedRoute from './ProtectedRoute';
import { render, screen } from "../lib/test-utils"
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('./UserContext', async () => {
    const actual = await vi.importActual('./UserContext');
    return {
        ...actual,
        useUserContext: vi.fn(),
    };
});

describe('useUserContext',  () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
  
  test('renders outlet when user exists', async () => {
    const mockUserContext = { 
        username: 'testuser', 
        user: { username: 'testuser', accounts: [], numOfAccounts: 0 }, 
        setUser: vi.fn(), fetchUser: vi.fn().mockResolvedValue(undefined)
    };
    vi.mocked(useUserContext).mockReturnValue(mockUserContext);
    
    render(
        <MemoryRouter initialEntries={['/home']}>
            <Routes>
                <Route path="/" />
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<div data-testid="home">Mocked Home</div>} />
                </Route>
        </Routes>
        </MemoryRouter>
    );
   expect(await screen.findByTestId('home')).toBeInTheDocument();

  });
  
  test('redirects to / when user is null', async () => {
    const mockUserContext = { 
        username: null, 
        user: null, 
        setUser: vi.fn(), fetchUser: vi.fn().mockResolvedValue(undefined)
    };
    
    vi.mocked(useUserContext).mockReturnValue(mockUserContext);
   
    render(
        <MemoryRouter initialEntries={['/home']}>
            <Routes>
                <Route path="/" element={<div data-testid="front-page">Mocked FrontPage</div>} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/home"/>
                </Route>
            </Routes>
        </MemoryRouter>
    );

    expect(await screen.findByTestId('front-page')).toBeInTheDocument();
  });
});