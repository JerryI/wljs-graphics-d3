

  function arrDepth(arr) {
    if (arr[0].length === undefined)        return 1;
    if (arr[0][0].length === undefined)     return 2;
    if (arr[0][0][0].length === undefined)  return 3;
  } 

  function transpose(matrix) {
    let newm = structuredClone(matrix);
    for (var i = 0; i < matrix.length; i++) {
      for (var j = 0; j < i; j++) {
   
        newm[i][j] = matrix[j][i];
        newm[j][i] = matrix[i][j];
      }
    } 
    return newm;
  } 
 
  
  let d3 = false;

  let g2d = {};
  g2d.name = "WebObjects/Graphics";

  interpretate.contextExpand(g2d);

 //polyfill for symbols
 ["FaceForm", "AlignmentPoint","AspectRatio","Axes","AxesLabel","AxesOrigin","AxesStyle","Background","BaselinePosition","BaseStyle","ColorOutput","ContentSelectable","CoordinatesToolOptions","DisplayFunction","Epilog","FormatType","Frame","FrameLabel","FrameStyle","FrameTicks","FrameTicksStyle","GridLines","GridLinesStyle","ImageMargins","ImagePadding","ImageSize","ImageSizeRaw","LabelStyle","Method","PlotLabel","PlotRange","PlotRangeClipping","PlotRangePadding","PlotRegion","PreserveImageOptions","Prolog","RotateLabel","Ticks","TicksStyle", "TransitionDuration"].map((name)=>{
  g2d[name] = () => name;
  
  });

  g2d.Graphics = async (args, env) => {
    if (!d3) d3 = await import('d3');

    /**
     * @type {Object}
     */  
    let options = await core._getRules(args, {...env, context: g2d, hold:true});
    

    if (Object.keys(options).length == 0 && args.length > 1) 
      options = await core._getRules(await interpretate(args[1], {...env, context: g2d, hold:true}), {...env, context: g2d, hold:true});

    console.log(options);

    /**
     * @type {HTMLElement}
     */
    var container = env.element;

    /**
     * @type {[Number, Number]}
     */
    let ImageSize = await interpretate(options.ImageSize, env) || [core.DefaultWidth, 0.618034*core.DefaultWidth];

    const aspectratio = await interpretate(options.AspectRatio, env) || 0.618034;

    //if only the width is specified
    if (!(ImageSize instanceof Array)) ImageSize = [ImageSize, ImageSize*aspectratio];

    console.log('Image size');
    console.log(ImageSize); 

    let margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = ImageSize[0] - margin.left - margin.right,
    height = ImageSize[1] - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg = d3.select(container)
    .append("svg");

    if ('ViewBox' in options) {

      let boxsize = await interpretate(options.ViewBox, env);
      if (!(boxsize instanceof Array)) boxsize = [0,0,boxsize, boxsize*aspectratio];
      svg.attr("viewBox", boxsize);     

    } else {
      svg.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
    }
    
    svg = svg  
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    let range = [[-1.15,1.15],[-1.15,1.15]];

    if (options.PlotRange) {
      range = await interpretate(options.PlotRange, env);
    }

    let axis = [false, false];

    let transitionType = d3.easeCubicInOut;

    if (options.TransitionType) {
      const type = await interpretate(options.TransitionType, {...env, context: g2d});
      switch (type) {
        case 'Linear':
          transitionType = d3.easeLinear
        break;
        default:
          transitionType = d3.easeCubicInOut
      }
    }

    //simplified version
    if (options.Axes) {
      options.Axes = await interpretate(options.Axes, env);

      if (options.Axes === true) {
        axis = [true, true];
      } else if (Array.isArray(options.Axes)) {
        axis = options.Axes;
      }
    }

    console.log(range);

    // Add X axis --> it is a date format
    let x = d3.scaleLinear()
      .domain(range[0])
      .range([ 0, width ]);
    
    if (axis[0]) svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));

    // Add Y axis
    let y = d3.scaleLinear()
      .domain(range[1])
      .range([ height, 0 ]);
    
    if (axis[1]) svg.append("g").call(d3.axisLeft(y));



    //since FE object insolates env already, there is no need to make a copy
      env.context = g2d;
      env.svg = svg;
      env.xAxis = x;
      env.yAxis = y;
      env.numerical = true;
      env.tostring = false;
      env.color = 'black';
      env.opacity = 1;
      env.strokeWidth = 1.5;
      env.pointSize = 0.013;
      env.fill = 'none';
      env.transition = {duration: 300, type: transitionType};
      
      if (options.TransitionDuration) {
        env.transition.duration = await interpretate(options.TransitionDuration, env);
      }

      env.local.xAxis = x;
      env.local.yAxis = y;

      await interpretate(options.Epilog, env);
      await interpretate(args[0], env);
      await interpretate(options.Prolog, env); 
  }

  g2d.Graphics.update = (args, env) => { console.error('root update method for Graphics is not supported'); }
  g2d.Graphics.destroy = (args, env) => { interpretate(args[0], {...env, context: g2d}); }

  g2d.AbsoluteThickness = (args, env) => {
    env.strokeWidth = interpretate(args[0], env);
  }

  g2d.PointSize = (args, env) => {
    env.pointSize = interpretate(args[0], env);
  }

  g2d.Annotation = core.List;

  g2d.Directive = async (args, env) => {
    for (const el of args) {
      await interpretate(el, env);
    }
  }

  g2d.Opacity = async (args, env) => {
    env.opacity = await interpretate(args[0], env);
  }

  g2d.RGBColor = async (args, env) => {
    if (args.length == 3) {
      const color = [];
      env.color = "rgb(";
      env.color += String(Math.floor(255 * (await interpretate(args[0], env)))) + ",";
      env.color += String(Math.floor(255 * (await interpretate(args[1], env)))) + ",";
      env.color += String(Math.floor(255 * (await interpretate(args[2], env)))) + ")";

    } else {
      const a = await interpretate(args[0], env);
      env.color = "rgb(";
      env.color += String(Math.floor(255 * a[0])) + ",";
      env.color += String(Math.floor(255 * a[1])) + ",";
      env.color += String(Math.floor(255 * a[2])) + ")";      
    }
  }

  g2d.RGBColor.destroy = (args, env) => {}
  g2d.Opacity.destroy = (args, env) => {}
  
  g2d.PointSize.destroy = (args, env) => {}
  g2d.AbsoluteThickness.destroy = (args, env) => {}

  g2d.Hue = (args, env) => {
    if (args.length == 3) {
      const color = args.map(el => 100*interpretate(el, env));
      env.color = "hls("+(3.59*color[0])+","+color[1]+","+color[2]+")";
    } else {
      console.error('g2d: Hue must have three arguments!');
    }
  } 
  
  g2d.Hue.destroy = (args, env) => {}

  g2d.CubicInOut = () => 'CubicInOut'
  g2d.Linear = () => 'Linear'

  g2d.Line = async (args, env) => {
    console.log('drawing a line');
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    const uid = uuidv4();
    env.local.uid = uid;

    env.local.uid = uid;



    switch(arrDepth(data)) {
      case 2:
        env.svg.append("path")
        .datum(data)
        .attr("class", 'line-'+uid)
        .attr("fill", "none")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth)
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          );    
      break;
    
      case 3:
        

        data.forEach((d, i)=>{
          env.svg.append("path")
          .datum(d).join("path")
          .attr("class", 'line-'+uid+'-'+i)
          .attr("fill", "none")
          .attr("stroke", env.color)
          .attr("stroke-width", env.strokeWidth)
          .attr("d", d3.line()
            .x(function(d) { return x(d[0]) })
            .y(function(d) { return y(d[1]) })
            );
        })    
      break;
    } 

    env.local.nsets = data.length;

    env.local.line = d3.line()
        .x(function(d) { return env.xAxis(d[0]) })
        .y(function(d) { return env.yAxis(d[1]) });
  }

  g2d.Line.destroy = (args, env) => {interpretate(args[0], env)}

  let interpolatePath = false;

  g2d.Line.update = async (args, env) => {
    if (!interpolatePath) interpolatePath = (await import('d3-interpolate-path')).interpolatePath;

    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    let obj;


    switch(arrDepth(data)) {
      case 2:
        const current = Math.min(data.length, env.local.nsets);
        //animate equal

        //animate the rest
        obj = env.svg.selectAll('.line-'+env.local.uid)
        .datum(data)
        .attr("class",'line-'+env.local.uid)
        .transition().ease(env.transition.type)
        .duration(env.transition.duration)
        .attrTween('d', function (d) {
          var previous = d3.select(this).attr('d');
          var current = env.local.line(d);
          return interpolatePath(previous, current);
        }); 

      break;
    
      case 3:
        for (let i=0; i < Math.min(data.length, env.local.nsets); ++i) {
          console.log('upd 1');
          obj = env.svg.selectAll('.line-'+env.local.uid+'-'+i)
          .datum(data[i])
          .attr("class",'line-'+env.local.uid+'-'+i)
          .transition().ease(env.transition.type)
          .duration(env.transition.duration)
          .attrTween('d', function (d) {
            var previous = d3.select(this).attr('d');
            var current = env.local.line(d);
            return interpolatePath(previous, current);
          }); 
        };

        if (data.length > env.local.nsets) {
          console.log('upd 2');
          console.log('new lines');
          for (let i=env.local.nsets; i < data.length; ++i) {
            obj = env.svg.append("path")
            .datum(data[i])
            .attr("class", 'line-'+env.local.uid+'-'+i)
            .attr("fill", "none")
            .attr("stroke", env.color)
            .attr("stroke-width", env.strokeWidth)
            .transition().ease(env.transition.type)
            .duration(env.transition.duration)            
            .attr("d", d3.line()
              .x(function(d) { return x(d[0]) })
              .y(function(d) { return y(d[1]) })
              );          
          }
        }

        if (data.length < env.local.nsets) {
          console.log('upd 3');
          for (let i=data.length; i < env.local.nsets; ++i) {
            obj = env.svg.selectAll('.line-'+env.local.uid+'-'+i).datum(data[0])
            .join("path")
            .attr("class",'line-'+env.local.uid+'-'+i)
            .transition().ease(env.transition.type)
            .duration(env.transition.duration)
            .attr("d", env.local.line);            
          }
        }

        
      break;
    }    

    env.local.nsets = Math.max(data.length, env.local.nsets);

    return obj;

  }

  g2d.Line.virtual = true

  g2d.Point = async (args, env) => {
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    if (arrDepth(data) < 2) {
      data = [data];
    }

    const uid = uuidv4();
    env.local.uid = uid;
    env.local.npoints = data.length;

    

    const object = env.svg.append('g')
    .selectAll()
    .data(data)
    .enter()
    .append("circle")
    .attr('class', "dot-"+uid)
      .attr("cx", function (d) { return x(d[0]); } )
      .attr("cy", function (d) { return y(d[1]); } )
      .attr("r", env.pointSize*100)
      .style("fill", env.color)
      .style("opacity", env.opacity);
    
    return object;
  } 

  g2d.Point.update = async (args, env) => {
    let data = await interpretate(args[0], env);
    
    if (arrDepth(data) < 2) {
      data = [data];
    }
  
    const x = env.xAxis;
    const y = env.yAxis;

    //mb better not to use selector, but give a direct reference
    const u = env.svg.selectAll('.dot-'+env.local.uid).data(data);

    if (data.length > env.local.npoints) {

      u.enter()
      .append("circle") // Add a new circle for each new elements
      .attr('class', "dot-"+env.local.uid)
      .merge(u).transition().ease(env.transition.type)
      .duration(env.transition.duration)
      .attr("cx", function (d) { return x(d[0]); } )
      .attr("cy", function (d) { return y(d[1]); } )
      .attr("r", env.pointSize*100)
      .style("fill", env.color);

    } else if (data.length < env.local.npoints) {

      u.transition().ease(env.transition.type)
      .duration(env.transition.duration)
      .attr("cx", function (d) { return x(d[0]); } )
      .attr("cy", function (d) { return y(d[1]); } )
      .attr("r", env.pointSize*100)
      .style("fill", env.color);

      //remove the rest
      u.exit()
      .transition().ease(env.transition.type) // and apply changes to all of them
      .duration(env.transition.duration)
      .style("opacity", 0)
      .remove();

    } else {

      u.transition().ease(env.transition.type)
      .duration(env.transition.duration)
      .attr("cx", function (d) { return x(d[0]); } )
      .attr("cy", function (d) { return y(d[1]); } )
      .attr("r", env.pointSize*100)
      .style("fill", env.color);

    }

    env.local.npoints = data.length;
  }

  g2d.Point.destroy = (args, env) => {interpretate(args[0], env)}

  g2d.Point.virtual = true  

  g2d.EventListener = async (args, env) => {
    const options = await core._getRules(args, env);

    const object = await interpretate(args[0], env);

    Object.keys(options).forEach((rule)=>{
      g2d.EventListener[rule](options[rule], object, env);
    });

    return null;
  }

  g2d.MiddlewareListener = async (args, env) => {
    const options = await core._getRules(args, env);
    const name = await interpretate(args[1], env);
    const uid = await interpretate(args[2], env);
    console.log(args);
    env.local.middleware = g2d.MiddlewareListener[name](uid, options, env);

    return (await interpretate(args[0], env));
  }

  g2d.MiddlewareListener.update = (args, env) => {
    return interpretate(args[0], env);
  }

  g2d.MiddlewareListener.end = (uid, params, env) => {
    const threshold = params.Threshold || 1.0;
    
    server.emitt(uid, `True`);
    console.log("pre Fire");

    return (object) => {
      let state = false;
      
      

      return object.then((r) => r.tween(uid, function (d) {
        return function (t) {
          if (t >= threshold && !state) {
            server.emitt(uid, `True`);
            console.log("FIRED");
            state = true;
          }
        }
      }))
    }
  }

  g2d.MiddlewareListener.endtransition = g2d.MiddlewareListener.end

  g2d.EventListener.destroy = (args, env) => {interpretate(args[0], env)}

  g2d.EventListener.drag = (uid, object, env) => {

    console.log('drag event generator');
    console.log(env.local);
    const xAxis = env.local.xAxis;
    const yAxis = env.local.yAxis;

    function dragstarted(event, d) {
      d3.select(this).raise().attr("stroke", "black");
    }

    const updatePos = throttle((x,y) => {
      server.emitt(uid, `{${x}, ${y}}`)
    });
  
    function dragged(event, d) {
      d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y))
    }
  
    function dragended(event, d) {
      d3.select(this).attr("stroke", null);
    }
  
    object.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  };

  g2d.EventListener.dragall = (uid, object, env) => {

    console.log('drag event generator');
    console.log(env.local);
    const xAxis = env.local.xAxis;
    const yAxis = env.local.yAxis;

    function dragstarted(event, d) {
      d3.select(this).raise().attr("stroke", "black");
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragstarted")
    }

    const updatePos = throttle((x,y,t) => {
      server.emitt(uid, `{"${t}", {${x}, ${y}}}`)
    });
  
    function dragged(event, d) {
      d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragged")
    }
  
    function dragended(event, d) {
      d3.select(this).attr("stroke", null);
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragended")
    }
  
    object.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  };


  g2d.EventListener.click = (uid, object, env) => {

    console.log('click event generator');
    console.log(env.local);
    const xAxis = env.local.xAxis;
    const yAxis = env.local.yAxis;

    const updatePos = throttle((x,y) => {
      server.emitt(uid, `{${x}, ${y}}`)
    });
  
    function clicked(event, d) {
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y))
    }
  
    object.on("click", clicked);
  };

  g2d.EventListener.zoom = (uid, object, env) => {

    console.log('zoom event generator');
    console.log(env.local);

    const updatePos = throttle(k => {
      server.emitt(uid, `${k}`);
    });

    function zoom(e) {
      console.log();
      updatePos(e.transform.k);
    }
  
    object.call(d3.zoom()
        .on("zoom", zoom));
  }; 
  
  g2d.Rotate = async (args, env) => {
    const degrees = await interpretate(args[1], env);
    if (args.length > 2) {
      const aligment = await interpretate(args[2], env);
    }

    const group = env.svg.append("g");
    
    env.local.group = group;

    await interpretate(args[0], {...env, svg: group});

    const centre = group.node().getBBox();

    const rotation = "rotate(" + (degrees / Math.PI * 180.0) + ", " + 
    (centre.x + centre.width / 2) + ", " + (centre.y + centre.height / 2) + ")";

    group.attr("transform", rotation);

    env.local.rotation = rotation;
  }

  g2d.Rotate.update = async (args, env) => {
    const degrees = await interpretate(args[1], env);

    const centre = env.local.group.node().getBBox();

    const rotation = "rotate(" + (degrees / Math.PI * 180.0) + ", " + 
    (centre.x + centre.width / 2) + ", " + (centre.y + centre.height / 2) + ")";

    var interpol_rotate = d3.interpolateString(env.local.rotation, rotation);

    env.local.group.transition().ease(env.transition.type).duration(env.transition.duration).attrTween('transform' , function(d,i,a){ return interpol_rotate } )
  
    env.local.rotation = rotation;
  }

  g2d.Rotate.virtual = true

  g2d.Translate = async (args, env) => {
    const pos = await interpretate(args[1], env);
    const group = env.svg.append("g");

    if (arrDepth(pos) > 1) throw 'List arguments for Translate is not supported for now!';
    
    env.local.group = group;

    const xAxis = env.xAxis;
    const yAxis = env.yAxis;    

    await interpretate(args[0], {...env, svg: group});
    return group.attr("transform", `translate(${xAxis(pos[0]) - xAxis(0)}, ${yAxis(pos[1]) - yAxis(0)})`);
  }

  g2d.Translate.update = async (args, env) => {
    const pos = await interpretate(args[1], env);

    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    return env.local.group.transition().ease(env.transition.type).duration(env.transition.duration).attr("transform", `translate(${xAxis(pos[0])- xAxis(0)}, ${yAxis(pos[1]) - yAxis(0)})`);
  }

  g2d.Translate.virtual = true  

  g2d.TransitionType = () => 'TransitionType'

  g2d.Center = () => 'Center'
  g2d.Center.destroy = g2d.Center
  g2d.Center.update = g2d.Center

  g2d.Degree = () => Math.PI/180.0;
  g2d.Degree.destroy = g2d.Degree
  g2d.Degree.update = g2d.Degree


  g2d.Rectangle = async (args, env) => {
    const from = await interpretate(args[0], env);
    const to = await interpretate(args[1], env);

    const x = env.xAxis;
    const y = env.yAxis;

    from[0] = x(from[0]);
    from[1] = y(from[1]);
    to[0] = x(to[0]);
    to[1] = y(to[1]);

    

    const size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];



    env.local.rect = env.svg.append('rect')
    .attr('x', from[0])
    .attr('y', from[1])
    .attr('width', size[0])
    .attr('height', size[1])
    .attr('stroke', 'black')
    .attr('fill', env.color);

     
  }
  
  g2d.Rectangle.update = async (args, env) => {
    const from = await interpretate(args[0], env);
    const to = await interpretate(args[1], env);

    const x = env.xAxis;
    const y = env.yAxis;

    from[0] = x(from[0]);
    from[1] = y(from[1]);
    to[0] = x(to[0]);
    to[1] = y(to[1]);

    

    const size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];



    env.local.rect.transition().ease(env.transition.type)
    .duration(env.transition.duration)
    .attr('x', from[0])
    .attr('y', from[1]) 
    .attr('width', size[0])
    .attr('height', size[1]);
  }

  g2d.Rectangle.virtual = true

  //plugs
  g2d.Void = (args, env) => {};

  g2d.Identity              = g2d.Void;
  g2d.Automatic             = g2d.Void;
  g2d.Scaled                = g2d.Void;
  g2d.GoldenRatio           = g2d.Void;
  g2d.None                  = g2d.Void;
  g2d.GrayLevel             = g2d.Void;
  g2d.AbsolutePointSize     = g2d.Void;
  g2d.CopiedValueFunction   = g2d.Void;

 

  console.log(g2d);

