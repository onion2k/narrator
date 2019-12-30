// import dependencies
import React from 'react'
import { Provider } from 'react-redux'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'
import { store } from '../store'

import ClassRedux from '../tests/class_redux'

afterEach(cleanup)

function renderWithRedux(component) {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  }
}

test('ClassRedux renders correctly', async () => {
  /**
   * Components that use <Link /> need to be contained in a router. <MemoryRouter> is lightweight and doesn't require any config.
   */

  const props = {
		selectorContent: ()=>{}, //func required
		propFunction: ()=>{}, //func required
		// content: 'Default content', //string 

  }

  const { getByText } = renderWithRedux(
    <MemoryRouter>
      <svg>
        <ClassRedux {...props} />
      </svg>
    </MemoryRouter>,
  )
  expect(getByText('Forgot Password')).toBeVisible()
})
