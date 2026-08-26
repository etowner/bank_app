import { render as rtlRender} from "@testing-library/react";
import { UserContextProvider } from "../context/UserContextProvider";
import type { RenderOptions } from "@testing-library/react";

function render(ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>)  {
  return rtlRender(ui, { wrapper: UserContextProvider, ...options});
}

export * from '@testing-library/react'
// override React Testing Library's render with our own
export {render}

