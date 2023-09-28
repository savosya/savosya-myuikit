import React from 'react'
import { Preview } from '@storybook/react'
import { storybookTheme } from './theme'

const StoryWrapperStyles: React.CSSProperties = {
  // boxSizing: 'border-box',
  // height: '100%',
  // width: '100%',
  // paddingBottom: 4,
  // margin: 0
}

const preview: Preview = {
  parameters: {
    viewMode: 'docs',
    backgrounds: { disable: true },
    grid: { disable: true },
    options: {
      storySort: {
        order: ['General', 'Components']
      }
    },
    docs: {
      theme: storybookTheme,
      canvas: {
        layout: 'padded',
        withToolbar: true,
        sourceState: 'hidden'
      },
      argTypes: {
        sort: 'requiredFirst',
        exclude: ['style']
      },
      controls: {
        exclude: ['style']
      }
    }
  },
  decorators: [
    Story => (
      <div style={StoryWrapperStyles}>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    )
  ]
}

export default preview
