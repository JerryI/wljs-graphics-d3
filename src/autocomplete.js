window.EditorAutocomplete.extend([  
    {
        "label": "Controls",
        "type": "keyword",
        "info": '"Controls"->True is an option for Graphics to use zoom and panning'  
    }, 
    {
        "label": "TransitionType",
        "type": "keyword",
        "info": '"TransitionType"->"Linear", "CubicInOut" is an option for Graphics to use smoothening filter for the transitions'  
    }, 
    {
        "label": "TransitionDuration",
        "type": "keyword",
        "info": '"TransitionDuration"->300, is an option for Graphics to set the duration of the transitions'  
    },
    {
        "label": "SVGAttribute",
        "type": "keyword",
        "info": 'SVGAttribute[GraphicsObject, AttrName->Value, ...], where AttrName is an d3-svg attribute of the object. Supports dynamic updates.'  
    },    
    
])

console.log('loaded!');