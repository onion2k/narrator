// import dependencies
import React from 'react'
import { Provider } from 'react-redux'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'
import { store } from '../store'

import asComp from './tests/class_redux.js'

afterEach(cleanup)

function renderWithRedux(component) {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  }
}

test('asComp renders correctly', async () => {
  /**
   * Components that use <Link /> need to be contained in a router. <MemoryRouter> is lightweight and doesn't require any config.
   */

  const props = {
Props
  }

  const { getByText } = renderWithRedux(
    <MemoryRouter>
      <svg>
        <Comp0 {...props} />
      </svg>
    </MemoryRouter>,
  )
  expect(getByText('Test Title')).toBeVisible()
})
