# FIRSTLang
Free Interactive Robot Steering Tool: A custom scripting language that can be used to control a (virtual) robot!

## How to use
```
import {evaluate} from 'firstlang'

evaluate("for 10 turn 10 forward 5 end")
```

## Examples
```
for 2
  forward 5
  turn 10
end

color red

for 2
  backward 5
  turn 10
end
```

This will output the following:
`["FORWARD 5", "TURN 10", "FORWARD 5", "TURN 10", "COLOR RED", "BACKWARD 5", "TURN 10", "BACKWARD 5", "TURN 10"]`