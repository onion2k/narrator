// import dependencies
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import asComp from './tests/functional_proptypes.js'

afterEach(cleanup)

test('asComp renders correctly', async () => {
  const props = {
Props
  }

  const { container } = render(
      <svg>
        <Comp4 {...props} />
      </svg>,
  )
  expect(container).toBeVisible()
})
