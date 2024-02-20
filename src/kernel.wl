BeginPackage["JerryI`Notebook`Graphics2D`", {"JerryI`Misc`Events`"}]

Controls::usage = "Controls -> True, False is an option for Graphics to use zoom and panning"
TransitionType::usage = "TransitionType -> \"Linear\", \"CubicInOut\" is an option for Graphics to use smoothening filter for the transitions"
TransitionDuration::usage = "TransitionDuration -> 300 is an option for Graphics to set the duration of the transitions"

SVGAttribute::usage = "SVGAttribute[GraphicsObject_, \"Attrname\" -> \"Value\"] where AttrName is an d3-svg attribute of the object. Supports dynamic updates"

EventListener::usage = "Internal wrapper for Graphics object to catch events"

AnimationFrameListener::usage = "AnimationFrameListener[symbol // Offload, \"Event\" -> _String] binds to a symbol instance and requests an animation frame once symbol was changed"

Begin["`Private`"]

listener[p_, list_] := With[{uid = CreateUUID[]}, With[{
    rules = Map[Function[rule, rule[[1]] -> uid ], list]
},
    EventHandler[uid, list];
    EventListener[p, rules]
] ]

Unprotect[Point, Rectangle, Text, Disk];

Point      /: EventHandler[p_Point, list_List] := listener[p, list]
Rectangle  /: EventHandler[p_Rectangle, list_List] := listener[p, list]
Text       /: EventHandler[p_Text, list_List] := listener[p, list]
Disk  /: EventHandler[p_Disk, list_List] := listener[p, list]

Protect[Point, Rectangle, Text, Disk];

End[]
EndPackage[]