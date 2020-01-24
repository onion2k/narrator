// import dependencies
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import asComp from './tests/mulitple_exports.js'

afterEach(cleanup)

test('asComp renders correctly', async () => {
  const props = {
Props
  }

  const { container } = render(
      <svg>
        <Comp5 {...props} />
      </svg>,
  )
  expect(container).toBeVisible()
})
