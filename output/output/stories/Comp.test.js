// import dependencies
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import asComp from './tests/funcs.js'

afterEach(cleanup)

test('asComp renders correctly', async () => {
  const props = {
Props
  }

  const { container } = render(
      <svg>
        <Comp3 {...props} />
      </svg>,
  )
  expect(container).toBeVisible()
})
)
ble()
})

})
)
nt}</Provider>),
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
