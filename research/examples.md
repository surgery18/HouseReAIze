- appear
  {
  name: "house",
  action_type: "appear",
  duration: 1
  }

  -disappear
  {
  name: "house",
  action_type: "disappear",
  duration: 1
  }

-move
{
name: "house",
action_type: "move",
position: {
startX: ...,
startY: ...,
endX: ...,
endY: ...,
scale: ...
rotation: ...
},
duration: ...
}

-scene change
{
"action_type": "scene",
"scene": "office",
"transition_effect": "none",
"duration": 1,
"initialState": {
"characters": [
{
"name": "House",
"visible": true,
"position": {
"startX":...,
"startY": ...,
"scale": ...,
"rotation": ...
}
},
{
"name": "Wilson",
"visible": true,
"position": {
"startX": ...,
"startY": ...,
"scale": ...,
"rotation": ...
}
}
]
}
