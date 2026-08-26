import { render, screen } from '../../lib/test-utils';
import Header from "./Header";

vi.mock('./ProfileManager/ProfileManager.tsx', () => ({
  default: () => <div data-testid="profile-manager">Mocked ProfileManager</div>,
}));


test("renders the bank app header with user profile manager", () => {
  render(<Header  />);

  expect(screen.getByText("Bank App")).toBeInTheDocument();
  expect(screen.getByText("Signed in as:")).toBeInTheDocument();
  expect(screen.getByTestId("profile-manager")).toBeInTheDocument();
});

