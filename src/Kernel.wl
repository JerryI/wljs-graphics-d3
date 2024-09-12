BeginPackage["JerryI`Notebook`Graphics2D`", {"JerryI`Misc`Events`", "Notebook`Editor`Kernel`FrontSubmitService`"}]

Controls::usage = "Controls -> True, False is an option for Graphics to use zoom and panning"
TransitionType::usage = "TransitionType -> \"Linear\", \"CubicInOut\" is an option for Graphics to use smoothening filter for the transitions"
TransitionDuration::usage = "TransitionDuration -> 300 is an option for Graphics to set the duration of the transitions"

ZoomAt::usage = "ZoomAt[k_, {x_,y_}:{0,0}] zooms and pans plot to a given point. Can be used together with FrontSubmit and MetaMarker"

SVGAttribute::usage = "SVGAttribute[GraphicsObject_, \"Attrname\" -> \"Value\"] where AttrName is an d3-svg attribute of the object. Supports dynamic updates"

EventListener::usage = "Internal wrapper for Graphics object to catch events"

AnimationFrameListener::usage = "AnimationFrameListener[symbol // Offload, \"Event\" -> _String] binds to a symbol instance and requests an animation frame once symbol was changed"


Graphics`Canvas;
Graphics`Canvas::usage = "Graphics`Canvas[] represents an SVG canvas of the current context in Graphics"

Graphics`Serialize;

Graphics`DPR;
Graphics`DPR::usage = "Returns the client's device pixel ratio. Use inside FrontFetch"

(*Unprotect[Image]
Options[Image] = Append[Options[Image], Antialiasing->True];*)

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
Disk       /: EventHandler[p_Disk, list_List] := listener[p, list]

Graphics`Canvas  /: EventHandler[p_Graphics`Canvas, list_List] := listener[p, list]

Protect[Point, Rectangle, Text, Disk];

Unprotect[Rasterize]
Rasterize[g_Graphics, any___] := With[{svg = FrontFetch[Graphics`Serialize[g, "TemporalDOM"->True] ]},
    ImportString[svg, "Svg"]
]





End[]
EndPackage[]