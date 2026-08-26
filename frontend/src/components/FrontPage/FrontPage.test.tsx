import { render, screen } from '../../lib/test-utils';
import FrontPage from "./FrontPage";

vi.mock('./AccountBox', () => ({
  default: () => <div data-testid="account-box">Mocked AccountBox</div>,
}));

describe("FrontPage", () => {
  beforeEach(() => {
    render(<FrontPage />);
  });

  test('renders the bank application heading', () => {
    expect(
      screen.getByRole('heading', { name: /bank application/i })
    ).toBeInTheDocument();
  });

  test('renders the AccountBox', () => {
    expect(screen.getByTestId('account-box')).toBeInTheDocument();
  });
});
