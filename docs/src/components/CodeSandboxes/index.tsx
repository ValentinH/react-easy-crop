import FilledInput from '@material-ui/core/FilledInput'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import React, { useState } from 'react'

const sandboxes = [
  { id: 'v69ly910ql', title: 'Basic with hooks' },
  { id: 'q80jom5ql6', title: 'Basic with class' },
  { id: 'q8q1mnr01w', title: 'With output of the cropped image' },
  { id: 'y09komm059', title: 'With image selected by the user' },
  { id: '53w20p2o3n', title: 'With round crop area and no grid' },
]

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      marginBottom: theme.spacing(1),
      minWidth: 280,
    },
  })
)

const CodeSandboxes: React.FC = props => {
  const classes = useStyles(props)
  const [sandbox, setSandbox] = useState('v69ly910ql')
  return (
    <div>
      <FormControl variant="filled" className={classes.formControl}>
        <InputLabel htmlFor="sandbox-example">Example</InputLabel>
        <Select
          value={sandbox}
          onChange={e => setSandbox(String(e.target.value))}
          input={<FilledInput name="example" id="sandbox-example" />}
        >
          {sandboxes.map(s => (
            <MenuItem key={s.id} value={s.id}>
              {s.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <iframe
        key={`iframe-${sandbox}`}
        title={`Codesandbox example ${sandbox}`}
        src={`https://codesandbox.io/embed/${sandbox}?autoresize=1&fontsize=14&hidenavigation=1`}
        style={{
          width: '100%',
          height: 500,
          border: 0,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 24,
        }}
        sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
      />
    </div>
  )
}

export default CodeSandboxes
