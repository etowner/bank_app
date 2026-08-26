import { render, screen, waitFor, within } from '../../lib/test-utils';
import AccountBox from "./AccountBox";
import { MemoryRouter } from 'react-router-dom';
import { userEvent } from '@testing-library/user-event';
import { registerUser, loginUser } from '../../api/userApi';
import { getAxiosError } from '../../api/axiosConfig';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../api/userApi');
vi.mock('../../api/axiosConfig');

const getCreatePanel = () => screen.getByRole('tabpanel', { name: /create account/i });
const getLoginPanel  = () => screen.getByRole('tabpanel', { name: /log in/i });

const renderAccountBox = () => render(<MemoryRouter> <AccountBox /> </MemoryRouter> );

describe("AccountBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAxiosError).mockReturnValue('Test error message');
  });

  test('renders create account tab initially', () => {
    renderAccountBox();

    expect(screen.getByRole('tab', { name: 'Create Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Log In' })).toHaveAttribute('aria-selected', 'false');

  });

  test('renders form elements', () => {
    renderAccountBox();
    
    expect(screen.getByLabelText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/enter password/i)).toBeInTheDocument();
    expect(within(getCreatePanel()).getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('handleTabSwitch should update active key', async () => {
    const user = userEvent.setup();
    renderAccountBox();

    await user.click(screen.getByRole('tab', { name: /log in/i }));

    expect(screen.getByRole('tab', { name: /log in/i }))
      .toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /create account/i }))
      .toHaveAttribute('aria-selected', 'false');
  })

  test('clears an existing error when switching tabs', async () => {
      const user = userEvent.setup();
      vi.mocked(registerUser).mockRejectedValue(new Error('fail'));
      renderAccountBox();

      await user.click(within(getCreatePanel()).getByRole('button', { name: /submit/i }));
      await screen.findAllByRole('alert');

      await user.click(screen.getByRole('tab', { name: /log in/i }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

  });

  describe('Create Account tab', () => {
   beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAxiosError).mockReturnValue('Test error message');
  });

    it('calls registerUser with the typed credentials', async () => {
      const user = userEvent.setup();
      vi.mocked(registerUser).mockResolvedValue(undefined);
      renderAccountBox();

      const panel = getCreatePanel();
      screen.debug(panel);
      await user.type(within(panel).getByLabelText(/enter username/i), 'alice');
      await user.type(within(panel).getByLabelText(/enter password/i), 'secret99');
      await user.click(within(panel).getByRole('button', { name: /submit/i }));

      expect(registerUser).toHaveBeenCalledExactlyOnceWith('alice', 'secret99');
    });

    it('navigates to /home after successful registration', async () => {
      const user = userEvent.setup();
      vi.mocked(registerUser).mockResolvedValue(undefined);
      renderAccountBox();

      await user.click(within(getCreatePanel()).getByRole('button', { name: /submit/i }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/home'));
    });

    it('shows an error alert and does not navigate when registration fails', async () => {
      const user = userEvent.setup();
      vi.mocked(registerUser).mockRejectedValue(new Error('Network error'));
      renderAccountBox();

      await user.click(within(getCreatePanel()).getByRole('button', { name: /submit/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Test error message');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Log In tab', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(getAxiosError).mockReturnValue('Test error message');
    });

    it('calls loginUser with the typed credentials', async () => {
      const user = userEvent.setup();
      vi.mocked(loginUser).mockResolvedValue(undefined);
      renderAccountBox();

      await user.click(screen.getByRole('tab', { name: /log in/i }));

      const panel = getLoginPanel();
      screen.debug(panel);
      await user.type(within(panel).getByLabelText(/enter username/i), 'bob');
      await user.type(within(panel).getByLabelText(/enter password/i), 'hunter2');
      await user.click(within(panel).getByRole('button', { name: /submit/i }));

      expect(loginUser).toHaveBeenCalledExactlyOnceWith('bob', 'hunter2');
    });

    it('navigates to /home after successful login', async () => {
      const user = userEvent.setup();
      vi.mocked(loginUser).mockResolvedValue(undefined);
      renderAccountBox();

      await user.click(screen.getByRole('tab', { name: /log in/i }));
      await user.click(within(getLoginPanel()).getByRole('button', { name: /submit/i }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/home'));
    });

    it('shows an error alert and does not navigate when login fails', async () => {
      const user = userEvent.setup();
      vi.mocked(loginUser).mockRejectedValue(new Error('401 Unauthorized'));
      renderAccountBox();

      await user.click(screen.getByRole('tab', { name: /log in/i }));
      await user.click(within(getLoginPanel()).getByRole('button', { name: /submit/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Test error message');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
