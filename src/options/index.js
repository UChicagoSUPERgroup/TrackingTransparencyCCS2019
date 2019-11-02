import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'

import { themeOverrides } from '../colors'
import Options from './OptionsUI'

theme.use({ overrides: themeOverrides })

ReactDOM.render(<Options />, document.getElementById('root'))
