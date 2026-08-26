import { render, screen } from '../../lib/test-utils';
import userEvent from "@testing-library/user-event";
import OpenAccount from "./OpenAccount";

const renderOpenAccount = (overrides = {}) => {
  const props = {
    openAcc: vi.fn(),
    setError: vi.fn(),
    ...overrides,
  };
  render(<OpenAccount {...props} />);
  return props;
};

describe("OpenAccount", () => {
  
  describe('initial render', () => {
    it('renders the toggle button', () => {
      renderOpenAccount();
      expect(screen.getByRole('button', { name: /open a new account/i }))
        .toBeInTheDocument();
    });

    it('accordion starts collapsed', () => {
      renderOpenAccount();
      expect(screen.getByRole('button', { name: /open a new account/i }))
        .toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('expanding the accordion', () => {
    it('sets aria-expanded to true after clicking the toggle', async () => {
      const user = userEvent.setup();
      renderOpenAccount();

      await user.click(screen.getByRole('button', { name: /open a new account/i }));

      expect(screen.getByRole('button', { name: /open a new account/i }))
        .toHaveAttribute('aria-expanded', 'true');
    });

    it('calls setError(null) when the toggle is clicked', async () => {
      const user = userEvent.setup();
      const { setError } = renderOpenAccount();

      await user.click(screen.getByRole('button', { name: /open a new account/i }));

      expect(setError).toHaveBeenCalledExactlyOnceWith(null);
    });
  });

  describe('account type selection', () => {
    // Since jsdom can't enforce CSS visibility, we click through directly.
    // The aria-expanded tests above already verify toggle behavior separately.
    it('calls openAcc with "Checkings" when Checkings is clicked', async () => {
      const user = userEvent.setup();
      const { openAcc } = renderOpenAccount();

      await user.click(screen.getByRole('button', { name: /checkings/i }));

      expect(openAcc).toHaveBeenCalledExactlyOnceWith('Checkings');
    });

    it('calls openAcc with "Savings" when Savings is clicked', async () => {
      const user = userEvent.setup();
      const { openAcc } = renderOpenAccount();

      await user.click(screen.getByRole('button', { name: /savings/i }));

      expect(openAcc).toHaveBeenCalledExactlyOnceWith('Savings');
    });
  });
});
