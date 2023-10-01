

  function arrDepth(arr) {
    if (arr.length === 0)                   return 0;
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
  let interpolatePath = false;

  let g2d = {};
  g2d.name = "WebObjects/Graphics";


  interpretate.contextExpand(g2d);

 //polyfill for symbols
 ["FaceForm", "Plot", "ListLinePlot", "ListPlot", "Automatic", "Controls","All","TickLabels","FrameTicksStyle", "AlignmentPoint","AspectRatio","Axes","AxesLabel","AxesOrigin","AxesStyle","Background","BaselinePosition","BaseStyle","ColorOutput","ContentSelectable","CoordinatesToolOptions","DisplayFunction","Epilog","FormatType","Frame","FrameLabel","FrameStyle","FrameTicks","FrameTicksStyle","GridLines","GridLinesStyle","ImageMargins","ImagePadding","ImageSize","ImageSizeRaw","LabelStyle","Method","PlotLabel","PlotRange","PlotRangeClipping","PlotRangePadding","PlotRegion","PreserveImageOptions","Prolog","RotateLabel","Ticks","TicksStyle", "TransitionDuration"].map((name)=>{
  g2d[name] = () => name;
  g2d[name].destroy = () => name;
  g2d[name].update = () => name;
  
  });

  g2d.Offset = async (args, env) => {
    const list = await interpretate(args[1], env);

    env.offset = {
      x: env.xAxis(list[0]) - env.xAxis(0),
      y: env.yAxis(list[1]) - env.yAxis(0)
    };

    return await interpretate(args[0], env);
  }

  g2d.Offset.destroy = g2d.Offset
  g2d.Offset.update = g2d.Offset

  g2d.Graphics = async (args, env) => {
    if (!d3) d3 = await import('d3');
    if (!interpolatePath) interpolatePath = (await import('d3-interpolate-path')).interpolatePath;

    g2d.interpolatePath = interpolatePath;
    g2d.d3 = d3;

    /**
     * @type {Object}
     */  
    let options = await core._getRules(args, {...env, context: g2d, hold:true});


    if (Object.keys(options).length == 0 && args.length > 1) {
      options = await core._getRules(await interpretate(args[1], {...env, context: g2d, hold:true}), {...env, context: g2d, hold:true});
 
    }

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

    //simplified version
    let axis = [false, false];
    let invertedTicks = false;
    let ticklengths = [5,5,5,5];
    let tickLabels = [true, true, true, true];
    let ticks = undefined;
    let framed = false;
    let axesstyle = undefined;
    let ticksstyle = undefined;

    console.log(options);

    if (options.Frame) {
      options.Frame = await interpretate(options.Frame, env);
      if (options.Frame === true) {
        framed = true;
      } else {
        if (options.Frame[0][0] === true) framed = true;
        if (options.Frame[0] === true) framed = true;  
      }
    }
    
    if (options.Axes) {
      options.Axes = await interpretate(options.Axes, env);
      if (options.Axes === true) {
        axis = [true, true];
      } else if (Array.isArray(options.Axes)) {
        axis = options.Axes;

      }
    }  

    if (framed) {
      invertedTicks = true;
      axis = [true, true, true, true];
    }

    

    if (options.Ticks) {
      options.Ticks = await interpretate(options.Ticks, env);
      //BRRRR

      //left, bottom
      if (Array.isArray(options.Ticks)) {
        if (Array.isArray(options.Ticks[0])) {
          if (Number.isInteger(options.Ticks[0][0]) || Array.isArray(options.Ticks[0][0])) {
            ticks = [...options.Ticks, ...options.Ticks];
          }
        }
      }      
    }

    if (options.FrameTicks && framed) {
      options.FrameTicks = await interpretate(options.FrameTicks, env);
      //I HATE YOU WOLFRAM

      //left,right,  bottom,top
      if (Array.isArray(options.FrameTicks)) {
        if (Array.isArray(options.FrameTicks[0])) {
          if (Array.isArray(options.FrameTicks[0][0])) {
            if (Number.isInteger(options.FrameTicks[0][0][0]) || Array.isArray(options.FrameTicks[0][0][0])) {
              ticks = [options.FrameTicks[0][0], options.FrameTicks[1][0], options.FrameTicks[0][1], options.FrameTicks[1][1]];
            }
          }
        }
      }
    }



    
    
    if (options.TickDirection) {
      const dir = await interpretate(options.TickDirection, env);
      if (dir === "Inward") invertedTicks = true;
      if (dir === "Outward") invertedTicks = false;
    }

    if (options.TickLengths) {
      options.TickLengths = await interpretate(options.TickLengths, env);
      if (!Array.isArray(options.TickLengths)) {
        ticklengths = [options.TickLengths, options.TickLengths, options.TickLengths, options.TickLengths];
      }
    }

    if (options.TickLabels) {
      options.TickLabels = await interpretate(options.TickLabels, env);
      if (!Array.isArray(options.TickLabels)) {
        tickLabels = [false, false, false, false];
      } else {
        tickLabels = options.TickLabels.flat();
      }      
    }

    //-----------------
    
    let margin = {top: 10, right: 30, bottom: 30, left: 60};
    let padding = {top: 0, right: 0, bottom: 0, left: 0}

    if (axis[2]) {
      margin.top = margin.bottom;
      margin.left = margin.right;
    }

    if (options.AxesLabel) {
      margin.top = margin.bottom;
      padding.bottom = 10;
    }

    if (framed) {
      padding.left = 20;
    }
    
    let width = ImageSize[0] - margin.left - margin.right;
    let height = ImageSize[1] - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg;
    
    
    if (env.inset) 
      svg = env.inset.append("svg");
    else
      svg = d3.select(container).append("svg");


    if ('ViewBox' in options) {

      let boxsize = await interpretate(options.ViewBox, env);
      if (!(boxsize instanceof Array)) boxsize = [0,0,boxsize, boxsize*aspectratio];
      svg.attr("viewBox", boxsize);     

    } else {
      svg.attr("width", width + margin.left + margin.right + padding.left)
         .attr("height", height + margin.top + margin.bottom + padding.bottom);
    }

    const listenerSVG = svg;
    
    svg = svg  
    .append("g")
      .attr("transform",
            "translate(" + (margin.left + padding.left) + "," + margin.top + ")");

    
    
    let range = [[-1.15,1.15],[-1.15,1.15]];

    if (options.PlotRange) {
      range = await interpretate(options.PlotRange, env);
    }

    if (options.FrameTicks && framed && !options.PlotRange) {
      //shitty fix for MatrixPlot 
      console.log('shitty fix for MatrixPLot');
      range = [[0,1], [0,1]];
      const test = [...options.FrameTicks].flat(Infinity);
      console.log(test);
      if (!isNaN(test[0])) {
        const xx = options.FrameTicks[0].flat(Infinity);
        const yy = options.FrameTicks[1].flat(Infinity);
        console.log(xx);
        console.log(yy);
        range[0][1] = Math.max(...xx);
        range[1][1] = Math.max(...yy);
      }
      console.log(range);
    }
    

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



    console.log(range);


    let gX = undefined;
    let gY = undefined;

    let gTX = undefined;
    let gRY = undefined;
    
      let x = d3.scaleLinear()
      .domain(range[0])
      .range([ 0, width ]);

    let xAxis = d3.axisBottom(x);
    let txAxis = d3.axisTop(x);

    console.log(axis);
    
    if (ticks) {
      if (Array.isArray(ticks[0][0])) {
        const labels = ticks[0].map((el) => el[1]);
        xAxis = xAxis.tickValues(ticks[0].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        xAxis = xAxis.tickValues(ticks[0]);
      }      
    }
    if (ticks) {
      if (Array.isArray(ticks[2][0])) {
        const labels = ticks[2].map((el) => el[1]);
        txAxis = txAxis.tickValues(ticks[2].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        txAxis = txAxis.tickValues(ticks[2]);
      }
    }

    if (!tickLabels[0]) xAxis = xAxis.tickFormat(x => ``);
    if (!tickLabels[1]) txAxis = txAxis.tickFormat(x => ``);

    if (invertedTicks) {
      xAxis = xAxis.tickSizeInner(-ticklengths[0]).tickSizeOuter(0);
      txAxis = txAxis.tickSizeInner(-ticklengths[2]).tickSizeOuter(0);
    } else { 
      xAxis = xAxis.tickSizeInner(ticklengths[0]).tickSizeOuter(0);
      txAxis = txAxis.tickSizeInner(ticklengths[2]).tickSizeOuter(0); 
    }

 
    // Add Y axis
    let y = d3.scaleLinear()
    .domain(range[1])
    .range([ height, 0 ]);

    let yAxis = d3.axisLeft(y);
    let ryAxis = d3.axisRight(y);

    if (ticks) {
      if (Array.isArray(ticks[1][0])) {
        const labels = ticks[1].map((el) => el[1]);
        yAxis = yAxis.tickValues(ticks[1].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        yAxis = yAxis.tickValues(ticks[1]);
      }  
    }

    if (ticks) {
      if (Array.isArray(ticks[3][0])) {
        const labels = ticks[3].map((el) => el[1]);
        ryAxis = ryAxis.tickValues(ticks[3].map((el) => el[0])).tickFormat(function (d, i) {
          return labels[i];
        });
      } else {
        ryAxis = ryAxis.tickValues(ticks[3]);
      }        
    }

    if (!tickLabels[2]) yAxis = yAxis.tickFormat(x => ``);
    if (!tickLabels[3]) ryAxis = ryAxis.tickFormat(x => ``);    
    
    if (invertedTicks) {
      yAxis = yAxis.tickSizeInner(-ticklengths[1]).tickSizeOuter(0);
      ryAxis = ryAxis.tickSizeInner(-ticklengths[3]).tickSizeOuter(0);
    } else {
      yAxis = yAxis.tickSizeInner(ticklengths[1]).tickSizeOuter(0);
      ryAxis = ryAxis.tickSizeInner(ticklengths[3]).tickSizeOuter(0);      
    }

    



    env.context = g2d;
    env.svg = svg.append("g")
    env.xAxis = x;
    env.yAxis = y;     
    env.numerical = true;
    env.tostring = false;
    env.offset = {x: 0, y: 0};
    env.color = 'rgb(68, 68, 68)';
    env.stroke = undefined;
    env.opacity = 1;
    env.fontsize = 10;
    env.fontfamily = 'sans-serif';
    env.strokeWidth = 1.5;
    env.pointSize = 0.013;
    env.transition = {duration: 300, type: transitionType};

    axesstyle = {...env};
    ticksstyle = {...env};

    if (options.AxesStyle) {
      await interpretate(options.AxesStyle, axesstyle);
    }

    if (options.FrameStyle) {
      console.warn('FrameStyle');
      console.log(options.FrameStyle);
      //console.log(JSON.stringify(axesstyle));
      await interpretate(options.FrameStyle, axesstyle);
      console.log(axesstyle);
    }    

    if (options.FrameTicksStyle) {
      await interpretate(options.FrameTicksStyle, ticksstyle);
    }

    if (axis[0]) gX = svg.append("g").attr("transform", "translate(0," + height + ")").call(xAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);
    if (axis[2]) gTX = svg.append("g").attr("transform", "translate(0," + 0 + ")").call(txAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);
    
    if (axis[1]) gY = svg.append("g").call(yAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);
    if (axis[3]) gRY = svg.append("g").attr("transform", "translate(" + width + ", 0)").call(ryAxis).attr('font-size', ticksstyle.fontsize).attr('fill', ticksstyle.color);



    if (options.AxesLabel && !framed) {
      
      options.AxesLabel = await interpretate(options.AxesLabel, {...env, hold:true});

      if (Array.isArray(options.AxesLabel)) {
        let temp = {...env};
        let value = await interpretate(options.AxesLabel[0], temp);
        if (value != 'None') {
          g2d.Text.PutText(gX.append("text")
          .attr("x", width + temp.offset.x)
          .attr("y", margin.bottom + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "end")
          , value, axesstyle); 
        }

        temp = {...env};
        value = await interpretate(options.AxesLabel[1], temp);        
        if (value != 'None') {
          g2d.Text.PutText(gY.append("text")
          .attr("x", 0 + temp.offset.x)
          .attr("y", -margin.top/2 + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "start")
          , value, axesstyle); 
        }        
 
      }

    }

    if (options.FrameLabel && framed) {
      options.FrameLabel = await interpretate(options.FrameLabel, {...env, hold:true});

      if (Array.isArray(options.FrameLabel)) {

        const lb = await interpretate(options.FrameLabel[0], {...env, hold:true});
        const rt = await interpretate(options.FrameLabel[1], {...env, hold:true});
        
        let temp;
        let value;

      if (lb != 'None' && lb) {
        temp = {...env};
        value = await interpretate(lb[0], temp);

        if (value != 'None') {
          g2d.Text.PutText(gY.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + temp.offset.x)
          .attr("x", -height/2 - temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "middle")
          , value, axesstyle); 
        } 


        temp = {...env};
        value = await interpretate(lb[1], temp);

        if (value != 'None') {
          g2d.Text.PutText(
            gRY.append("text")
              .attr("x", 0 + temp.offset.x)
              .attr("y", margin.bottom + temp.offset.y)
              .attr("font-size", axesstyle.fontsize)
              .attr("fill", axesstyle.color)
              .attr("text-anchor", "middle"),
            
            value, axesstyle);
        } 
      }  

      if (rt != 'None' && rt) {

        temp = {...env};
        value = await interpretate(rt[1], temp);        
        
        if (value != 'None') {
          g2d.Text.PutText(
          gTX.append("text")
          .attr("x", width/2 + temp.offset.x)
          .attr("y", margin.bottom + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "middle")
          , value, axesstyle);
        }

        temp = {...env};
        value = await interpretate(rt[0], temp);        

        if (value != 'None') {
          g2d.Text.PutText(gX.append("text")
          .attr("x", width/2 + temp.offset.x)
          .attr("y", margin.bottom + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "middle")
          , value, axesstyle); 
        }   
         
      }    
 
      }

    } 
    //since FE object insolates env already, there is no need to make a copy

      
      if (options.TransitionDuration) {
        env.transition.duration = await interpretate(options.TransitionDuration, env);
      }

      env.local.xAxis = x;
      env.local.yAxis = y;

      if (options.Controls) {
        //add pan and zoom
        if (await interpretate(options.Controls, env))
          addPanZoom(listenerSVG, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y);
      }

      if (core._NotebookUI && !env.inset) {
        const controls = document.createElement('div');
        controls.classList.add('d3-controls');

        controls.innerHTML = icoExport;

        controls.addEventListener('click', ()=>{
          saveFile(serialize(container.firstChild), "plot.svg");
        });

        env.element.appendChild(controls);
      }



      await interpretate(options.Prolog, env); 
      await interpretate(args[0], env);
      await interpretate(options.Epilog, env);
  }

  const icoExport = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" class="w1 h1 mr1"><path d="M2 3C2 1.89543 2.89543 1 4 1H10L14 5V8H12V6H9V3H4V13H6V15H4C2.89543 15 2 14.1046 2 13V3Z"></path><path d="M7.3598 12.7682L8.64017 11.2318L11 13.1983L13.3598 11.2318L14.6402 12.7682L11 15.8017L7.3598 12.7682Z"></path><path d="M10 15L10 9L12 9L12 15L10 15Z"></path></svg>`

  g2d.Graphics.update = (args, env) => { console.error('root update method for Graphics is not supported'); }
  g2d.Graphics.destroy = (args, env) => { interpretate(args[0], {...env, context: g2d}); }

  g2d.Inset = async (args, env) => {
    const co = await interpretate(args[1], env);

    const group = env.svg.append('g');
    await interpretate(args[0], {...env, inset: group});

    env.local.group = group;

    return group.attr("transform", "translate(" + (env.xAxis(co[0])) + "," + (env.yAxis(co[1])) + ")");
  }

  g2d.Inset.update = async (args, env) => {
    const co = await interpretate(args[1], env);

    env.local.group.attr("transform", "translate(" + (env.xAxis(co[0])) + "," + (env.yAxis(co[1])) + ")");
    return env.local.group;
  }

  g2d.Inset.destroy = async (args, env) => {
    console.warn('Destory method is not supported for Inset');
  }

  g2d.Inset.virtual = true

  const serialize = (svg) => {
    const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";

    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, "#");
        }
      }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer;
    const string = serializer.serializeToString(svg);
    return new Blob([string], {type: "image/svg+xml"});
  };

  function saveFile(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0)
    }
  }

  const addPanZoom = (listener, raw, view, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y) => {
      const zoom = d3.zoom()
        .filter(filter)
        .on("zoom", zoomed);

      listener.call(zoom);


      function zoomed({ transform }) {
        view.attr("transform", transform);
        if (gX)
          gX.call(xAxis.scale(transform.rescaleX(x)));
        if (gY)
          gY.call(yAxis.scale(transform.rescaleY(y)));

        if (gTX)
          gTX.call(txAxis.scale(transform.rescaleX(x)));
        if (gRY)
          gRY.call(ryAxis.scale(transform.rescaleY(y)));          
      }
  
    
      // prevent scrolling then apply the default filter
      function filter(event) {
        event.preventDefault();
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      }    
  }

  g2d.SVGAttribute = async (args, env) => {
    const attrs = await core._getRules(args, env);
    let obj = await interpretate(args[0], env);
    
    Object.keys(attrs).forEach((a)=> {
      obj = obj.attr(a, attrs[a]);
    });

    env.local.object = obj;
    return obj;
  }

  g2d.SVGAttribute.update = async (args, env) => {
    const attrs = await core._getRules(args, env);
    //skipping evaluation of the children object
    let obj = env.local.object
      .transition()
      .ease(env.transition.type)
      .duration(env.transition.duration);
    
    Object.keys(attrs).forEach((a)=> {
      obj = obj.attr(a, attrs[a]);
    });

    return obj;
  }  

  g2d.SVGAttribute.destroy = async (args, env) => {
    const attrs = await core._getRules(args, env);
    await interpretate(args[0], env);
  }

  g2d.SVGAttribute.virtual = true;


  const lab2rgb = (lab) => {
    var y = (lab[0] + 16) / 116,
        x = lab[1] / 500 + y,
        z = y - lab[2] / 200,
        r, g, b;
  
    x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
    y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
    z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);
  
    r = x *  3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y *  1.8758 + z *  0.0415;
    b = x *  0.0557 + y * -0.2040 + z *  1.0570;
  
    r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
    g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
    b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;
  
    return [Math.max(0, Math.min(1, r)) * 255, 
            Math.max(0, Math.min(1, g)) * 255, 
            Math.max(0, Math.min(1, b)) * 255]
  }

  g2d.LABColor =  async (args, env) => {
    let lab;
    if (args.length > 1)
      lab = [await interpretate(args[0], env), await interpretate(args[1], env), await interpretate(args[2], env)];
    else 
      lab = await interpretate(args[0], env);

    const color = lab2rgb(lab.map(e => e*255.0));
    console.log('LAB color');
    console.log(color);
    
    env.color = "rgb("+color[0]+","+color[1]+","+color[2]+")";
    if (args.length > 3) env.opacity = await interpretate(args[3], env);
    
    return env.color;   
  }

  g2d.LABColor.update = () => {}
  g2d.LABColor.destroy = () => {}

  g2d.arrowGenerator = undefined

  let arrow1;

  g2d.Arrow = async (args, env) => {
    if (!arrow1) arrow1 = (await import('d3-arrow')).arrow1;

    const x = env.xAxis;
    const y = env.yAxis;

    const uid = uuidv4();
    const arrow = arrow1()
    .id(uid)
    .attr("fill", env.color)
    .attr("stroke", "none");

    env.svg.call(arrow);

    const path = await interpretate(args[0], env);

    const object = env.svg.append("path")
    .datum(path)
    .attr("vector-effect", "non-scaling-stroke")
    .attr("fill", "none")
    .attr('opacity', env.opacity)
    .attr("stroke", env.color)
    .attr("stroke-width", env.strokeWidth)
    .attr("d", d3.line()
      .x(function(d) { return x(d[0]) })
      .y(function(d) { return y(d[1]) })
    ).attr("marker-end", "url(#"+uid+")"); 
    
    return object;

  }

  g2d.Arrowheads = async () => {
    console.warn('not implemented!');
  }

  g2d.Arrowheads.destroy = async () => {};

  g2d.Arrow.destroy = async () => {}  

  g2d.Text = async (args, env) => {
    const text = await interpretate(args[0], env);
    const coords = await interpretate(args[1], env);

    const object = env.svg.append('text')
      .attr("font-family", env.fontfamily)
      .attr("font-size", env.fontsize)
      .attr("fill", env.color);

    if (args.length > 2) {
      const offset = await interpretate(args[2], env);

      object
      .attr("x", env.xAxis(coords[0] + offset[0]))
      .attr("y", env.yAxis(coords[1] + offset[1]));

    } else {

      object
      .attr("x", env.xAxis(coords[0]))
      .attr("y", env.yAxis(coords[1]));

    }

    g2d.Text.PutText(object, text, env);

    env.local.object = object;

    return object;
  }

  g2d.Text.PutText = (object, text, env) => {
    //parse the text
    if (!text) return;
    const tokens = [g2d.Text.TokensSplit(text.replaceAll(/\\([a-zA-z]+)/g, g2d.Text.GreekReplacer), g2d.Text.TextOperators)].flat(Infinity);
    console.log(tokens);

    object.html(tokens.shift());

    let token;
    let dy = 0;
    while((token = tokens.shift()) != undefined) {
      if (typeof token === 'string') {
        object.append('tspan').html(token).attr('font-size', env.fontsize).attr('dy', -dy);
        dy = 0;
      } else {
        dy = -env.fontsize*token.ky;
        object.append('tspan').html(token.data).attr('font-size', Math.round(env.fontsize*token.kf)).attr('dy', dy);
      }
    }
  }

  g2d.Text.TextOperators = [
    {
      type: 'sup',
      handler: (a) => a,
      regexp: /\^(\d{1,3})/,
      meta: {
        ky: 0.5,
        kf: 0.5
      }
    },
    {
      type: 'sup',
      handler: (a) => a,
      regexp: /\^{([^{|}]*)}/,
      meta: {
        ky: 0.5,
        kf: 0.5
      }      
    },
    {
      type: 'sub',
      handler: (a) => a,
      regexp: /\_(\d{1,3})/,
      meta: {
        ky: -0.5,
        kf: 0.5
      }      
    },
    {
      type: 'sub',
      handler: (a) => a,
      regexp: /\_{([^{|}]*)}/,
      meta: {
        ky: -0.5,
        kf: 0.5
      }
    }  
  ];
  
  g2d.Text.GreekReplacer = (a, b, c) => {
    return "&" +
        b
          .toLowerCase()
          .replace("sqrt", "radic")
          .replace("degree", "deg") +
        ";";
  }
  
  g2d.Text.TokensSplit = (str, ops, index = 0) => {
    if (index === ops.length || index < 0) return str;
    const match = str.match(ops[index].regexp);
    if (match === null) return g2d.Text.TokensSplit(str, ops, index + 1);
    const obj = {type: ops[index].type, data: ops[index].handler(match[1]), ...ops[index].meta};
    return [g2d.Text.TokensSplit(str.slice(0, match.index), ops, index + 1), obj, g2d.Text.TokensSplit(str.slice(match.index+match[0].length), ops, 0)]
  }  

  g2d.Text.virtual = true;

  g2d.Text.update = async (args, env) => {
    const text = await interpretate(args[0], env);
    const coords = await interpretate(args[1], env);

    const trans = env.local.object
      .transition()
      .ease(env.transition.type)
      .duration(env.transition.duration)
      .text(text)
      .attr("x", env.xAxis(coords[0]))
      .attr("y", env.yAxis(coords[1]))
      .attr("fill", env.color);

    return trans;
  }   

  g2d.Text.destroy = async (args, env) => {
    for (const o of args) {
      await interpretate(o, env);
    }
  }

  //transformation context to convert fractions and etc to SVG form
  g2d.Text.subcontext = {}
  //TODO

  g2d.FontSize = () => "FontSize"
  g2d.FontSize.destroy = g2d.FontSize
  g2d.FontSize.update = g2d.FontSize
  g2d.FontFamily = () => "FontFamily"
  g2d.FontFamily.destroy = g2d.FontFamily
  g2d.FontFamily.update = g2d.FontFamily
  
  g2d.Style = async (args, env) => {
    const options = await core._getRules(args, env);
    
    if (options.FontSize) {
      env.fontsize = options.FontSize;
    }  
  
    if (options.FontFamily) {
      env.fontfamily = options.FontFamily
    } 
  
    return await interpretate(args[0], env);
  }

  g2d.Style.destroy = async (args, env) => {
    const options = await core._getRules(args, env);  
    return await interpretate(args[0], env);
  }  
  
  g2d.Style.update = async (args, env) => {
    const options = await core._getRules(args, env);
    
    if (options.FontSize) {
      env.fontsize = options.FontSize;
    }  
  
    if (options.FontFamily) {
      env.fontfamily = options.FontFamily
    } 
  
    return await interpretate(args[0], env);
  }  

  g2d.GraphicsComplex = async (args, env) => {
    const vertices = await interpretate(args[0], env);
    return await interpretate(args[1], {...env, vertices: vertices});
  }

  g2d.GraphicsComplex.destroy = async (args, env) => {
    await interpretate(args[0], env);
    await interpretate(args[1], env);
  }

  g2d.GraphicsGroup = async (args, env) => {
    return await interpretate(args[0], env);
  }

  g2d.GraphicsGroup.update = async (args, env) => {
    return await interpretate(args[0], env);
  }  

  g2d.GraphicsGroup.destroy = async (args, env) => {
    await interpretate(args[0], env);
  }  

  g2d.AbsoluteThickness = (args, env) => {
    env.strokeWidth = interpretate(args[0], env);
  }

  g2d.PointSize = (args, env) => {
    env.pointSize = interpretate(args[0], env);
  }

  g2d.Annotation = core.List;

  g2d.Directive = async (args, env) => {
    const opts = await core._getRules(args, env);
    for (const o of Object.keys(opts)) {
      env[o.toLowerCase()] = opts[o];
    }

    for (let i=0; i<(args.length - Object.keys(opts).length); ++i) {
      await interpretate(args[i], env);
    }
  }

  g2d.Directive.destroy = g2d.Directive

  g2d.EdgeForm = async (args, env) => {
    const copy = {...env};
    await interpretate(args[0], copy);

    env.strokeWidth = copy.strokeWidth;
    
    env.strokeOpacity = copy.opacity;
    //hack. sorry
    if (copy.color !== 'rgb(68, 68, 68)')
      env.stroke = copy.color;
  }

  g2d.EdgeForm.update = async (args, env) => {

  }

  g2d.EdgeForm.destroy = async (args, env) => {

  }

  g2d.Opacity = async (args, env) => {
    env.opacity = await interpretate(args[0], env);
  }

  g2d.GrayLevel = async (args, env) => {
    let level = await interpretate(args[0], env);
    if (level.length) {
      level = level[0]
    }

    level = Math.floor(level * 255);

    env.color = `rgb(${level},${level},${level})`;
    return env.color;
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

    return env.color;
  }

  g2d.RGBColor.destroy = (args, env) => {}
  g2d.Opacity.destroy = (args, env) => {}
  g2d.GrayLevel.destroy = (args, env) => {}
  
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

  g2d.Tooltip = () => {
    console.log('Tooltip is not implemented.');
  }

  g2d.Tooltip.destroy = g2d.Tooltip

  g2d.Polygon = async (args, env) => {
    let points = await interpretate(args[0], env);

    if (env.vertices) {
      env.local.line = d3.line()
      .x(function(d) { return env.xAxis(d[0]) })
      .y(function(d) { return env.yAxis(d[1]) });

      const array = [];

      points.forEach((path) => {
        array.push(env.svg.append("path")
          .datum(path.map((vert) => env.vertices[vert-1]))
          .attr("fill", env.color)
          .attr('fill-opacity', env.opacity)
          .attr('stroke-opacity', env.strokeOpacity || env.opacity)
          .attr("vector-effect", "non-scaling-stroke")
          .attr("stroke-width", env.strokeWidth)
          .attr("stroke", env.stroke || env.color)
          .attr("d", env.local.line));

      });

      env.local.area = array;
      return env.local.area;
    }
  
    points.push(points[0]);
    
    env.local.line = d3.line()
          .x(function(d) { return env.xAxis(d[0]) })
          .y(function(d) { return env.yAxis(d[1]) });
  
    env.local.area = env.svg.append("path")
      .datum(points)
      .attr("fill", env.color)
      .attr('fill-opacity', env.opacity)
      .attr('stroke-opacity', env.strokeOpacity || env.opacity)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", env.strokeWidth)
      .attr("stroke", env.stroke || env.color)
      .attr("d", env.local.line);
    
    
    return env.local.area;
  }
  
  g2d.Polygon.update = async (args, env) => {
    let points = await interpretate(args[0], env);

    if (env.vertices) {
      throw 'update method of vertices is not supported'
    }    
  
    const x = env.xAxis;
    const y = env.yAxis;
  
    const object = env.local.area
          .datum(points)
          .transition().ease(env.transition.type)
          .duration(env.transition.duration)
          .attrTween('d', function (d) {
            var previous = d3.select(this).attr('d');
            var current = env.local.line(d);
            return interpolatePath(previous, current);
          }); 
    
    return object;  
  }
  
  g2d.Polygon.destroy = async (args, env) => {
    /*env.local.area.datum([])
          .transition().ease(env.transition.type)
          .duration(env.transition.duration); */
  
    interpretate(args[0], env);
  }
  
  g2d.Polygon.virtual = true; //for local memeory and dynamic binding


  g2d.Line = async (args, env) => {
    console.log('drawing a line');
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    const uid = uuidv4();
    env.local.uid = uid;

    env.local.uid = uid;

    let object;


    switch(arrDepth(data)) {
      case 0:
        //empty
        object = env.svg.append("path")
        .datum([])
        .attr("class", 'line-'+uid)
        .attr("fill", "none")
        .attr("vector-effect", "non-scaling-stroke")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth)
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          );    

      break;        
      case 2:
        object = env.svg.append("path")
        .datum(data)
        .attr("class", 'line-'+uid)
        .attr("vector-effect", "non-scaling-stroke")
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
          object = env.svg.append("path")
          .datum(d).join("path")
          .attr("class", 'line-'+uid+'-'+i)
          .attr("vector-effect", "non-scaling-stroke")
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

    return object;
  }

  g2d.Line.destroy = (args, env) => {interpretate(args[0], env)}



  g2d.Line.update = async (args, env) => {

    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    let obj;


    switch(arrDepth(data)) {
      case 0:
        //empty
        obj = env.svg.selectAll('.line-'+env.local.uid)
        .datum([])
        .attr("class",'line-'+env.local.uid)
        .transition().ease(env.transition.type)
        .duration(env.transition.duration)
        .attrTween('d', function (d) {
          var previous = d3.select(this).attr('d');
          var current = env.local.line(d);
          return interpolatePath(previous, current);
        }); 

      break;
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

    if (env.vertices) {
      data = data.map((e) => env.vertices[e-1]);
    } else {
      const dp = arrDepth(data);
      if (dp === 0) {
          data = [];
      } else {
        if (dp < 2) {
          data = [data];
        }
      }
    }



    const uid = uuidv4();
    env.local.uid = uid;

    /*const object = env.svg.append('g')
    .selectAll()
    .data(data)
    .enter()
    .append("circle")
    .attr("vector-effect", "non-scaling-stroke")
    .attr('class', "dot-"+uid)
      .attr("cx", function (d) { return x(d[0]); } )
      .attr("cy", function (d) { return y(d[1]); } )
      .attr("r", env.pointSize*100)
      .style("fill", env.color)
      .style("opacity", env.opacity);*/

    const object = env.svg.append('g')
    .style("stroke-width", env.pointSize*100*2)
    .style("stroke-linecap", "round")
    .style("stroke", env.color)
    .style("opacity", env.opacity);

    const points = [];

    //a hack to make non-scalable 
    //https://muffinman.io/blog/svg-non-scaling-circle-and-rectangle/

    data.forEach((d) => {
      points.push(
       object.append("path")
      .attr("d", `M ${x(d[0])} ${y(d[1])} l 0.0001 0`) 
      .attr("vector-effect", "non-scaling-stroke")
      );
    });

    env.local.points = points;
    env.local.object = object;
    
    return object;
  } 

  g2d.Point.update = async (args, env) => {
    let data = await interpretate(args[0], env);
    
    if (env.vertices) throw('vertices update method is not supported!');

    const dp = arrDepth(data);
    if (dp === 0) {
        data = [];
    } else {
      if (dp < 2) {
        data = [data];
      }
    }
  
    const x = env.xAxis;
    const y = env.yAxis;

    let object;
  
    const u = env.local.object;

    const minLength = Math.min(env.local.points.length, data.length);

    let prev = [0,0];

    for (let i=env.local.points.length; i<data.length; i++) {
      if (i-1 >= 0) prev = data[i-1];

      object = u.append("path")
      .attr("d", `M ${x(prev[0])} ${y(prev[1])} l 0.0001 0`) 
      .style("opacity", env.opacity/5)
      .attr("vector-effect", "non-scaling-stroke");

      env.local.points.push(object);

      object = object.transition().ease(env.transition.type)
      .duration(env.transition.duration)
      .attr("d", `M ${x(data[i][0])} ${y(data[i][1])} l 0.0001 0`) 
      .style("opacity", env.opacity);
    };

    for (let i=env.local.points.length; i>data.length; i--) {
      object = env.local.points.pop();

      object.transition().ease(env.transition.type)
      .duration(env.transition.duration)
      .style("opacity", 0)
      .remove(); 
    };

    for (let i=0; i < minLength; i++) {
      object = env.local.points[i].transition().ease(env.transition.type)
      .duration(env.transition.duration)
      .attr("d", `M ${x(data[i][0])} ${y(data[i][1])} l 0.0001 0`);
    }

    return object;
  }

  g2d.Point.destroy = (args, env) => {interpretate(args[0], env)}

  g2d.Point.virtual = true  

  g2d.EventListener = async (args, env) => {
    const options = await core._getRules(args, env);

    let object = await interpretate(args[0], env);
    if (Array.isArray(object)) object = object[0];

    Object.keys(options).forEach((rule)=>{
      g2d.EventListener[rule](options[rule], object, env);
    });

    return null;
  }

  g2d.EventListener.update = async (args, env) => {
    console.log('EventListener does not support updates');
  }
  
  g2d.EventListener.onload = (uid, object, env) => {

    console.log('onload event generator');
    server.emitt(uid, `True`);
  };  

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

  g2d.MiddlewareListener.destroy = (args, env) => {
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
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    let origin = [];

    function dragstarted(event, d) {
      if (origin.length === 0) origin = [event.x, event.y];
      //d3.select(this).raise().attr("stroke", "black");   
    }

    const updatePos = throttle((x,y) => {
      server.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'))
    });
  
    function dragged(event, d) {
      d3.select(this).raise().attr("transform", d=> "translate("+[event.x - origin[0], event.y  - origin[1]]+")" )

      updatePos(xAxis.invert(event.x), yAxis.invert(event.y))
    }
  
    function dragended(event, d) {
      //d3.select(this).attr("stroke", null);
    }
  
    object.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  };

  g2d.EventListener.dragall = (uid, object, env) => {

    console.log('drag event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    function dragstarted(event, d) {
      //d3.select(this).raise().attr("stroke", "black");
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragstarted")
    }

    const updatePos = throttle((x,y,t) => {
      server.emitt(uid, `{"${t}", {${x}, ${y}}}`.replace('e', '*^').replace('e', '*^'))
    });
  
    function dragged(event, d) {
      //d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y), "dragged")
    }
  
    function dragended(event, d) {
      //d3.select(this).attr("stroke", null);
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
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'))
    });
  
    function clicked(event, d) {
      updatePos(xAxis.invert(event.x), yAxis.invert(event.y))
    }
  
    object.call(d3.drag()
        .on("start", clicked));
  };

  g2d.EventListener.mousemove = (uid, object, env) => {

    console.log('mouse event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'));
    });
  
    function moved(arr) {
      updatePos(xAxis.invert(arr[0]), yAxis.invert(arr[1]))
    }
  
    object.on("mousemove", e => moved(d3.pointer(e)));
  };  

  g2d.EventListener.mouseover = (uid, object, env) => {

    console.log('mouse event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'))
    });
  
    function moved(arr) {
      updatePos(xAxis.invert(arr[0]), yAxis.invert(arr[1]))
    }
  
    object.on("mouseover", e => moved(d3.pointer(e)));
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
    .attr("vector-effect", "non-scaling-stroke")
    .attr('stroke', env.stroke)
    .attr('opacity', env.opacity)
    .attr('fill', env.color);

    return env.local.rect;
     
  }

  g2d.Rectangle.destroy = async (args, env) => {
    await interpretate(args[0], env);
    await interpretate(args[1], env);
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
  g2d.Scaled                = g2d.Void;
  g2d.GoldenRatio           = g2d.Void;
  g2d.None                  = g2d.Void;

  g2d.AbsolutePointSize     = g2d.Void;
  g2d.CopiedValueFunction   = g2d.Void;

  g2d.Raster = async (args, env) => {
    if (env.image) return await interpretate(args[0], env);

    const data = await interpretate(args[0], {...env, context: g2d, nfast:true, numeric:true});
    console.log(args);
    const height = data.length;
    const width = data[0].length;
    const rgb = data[0][0].length;

    const x = env.xAxis;
    const y = env.yAxis;    

    let ranges = [[0, width],[0, height]];
    if (args.length > 1) {
      const optsRanges = await interpretate(args[1], env);
      ranges[0][0] = optsRanges[0][0];
      ranges[0][1] = optsRanges[1][0];
      ranges[1][0] = optsRanges[0][1];
      ranges[1][1] = optsRanges[1][1];      
    }

    let scaling = [0, 1];
    if (args.length > 2) {
      scaling = await interpretate(args[2], env);
      //not implemented
      console.warn('scaling is not implemented!');
    }



    const rectWidth = Math.abs((x(ranges[0][1]) - x(ranges[0][0])) / width);
    const rectHeight = Math.abs((y(ranges[1][1]) - y(ranges[1][0])) / height);

    const stepX = (ranges[0][1] - ranges[0][0]) / width;
    const stepY = (ranges[1][1] - ranges[1][0]) / height;

    const group = env.svg;

    if (!rgb) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', env.opacity)
          .attr('fill', `rgb(${255*data[i][j]}, ${255*data[i][j]}, ${255*data[i][j]})`);
          
        }
      }  
      return;
    }

    if (rgb === 2) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', data[i][j][1])
          .attr('fill', `rgb(${255*data[i][j][0]}, ${255*data[i][j][0]}, ${255*data[i][j][0]})`);
          
        }
      }  
      return;
    }    

    if (rgb === 3) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', env.opacity)
          .attr('fill', `rgb(${255*data[i][j][0]}, ${255*data[i][j][1]}, ${255*data[i][j][2]})`);
          
        }
      } 
      return;
    }

    if (rgb === 4) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {

          group.append('rect')
          .attr('x', x(stepX * j + ranges[0][0]))
          .attr('y', y(stepY * i + ranges[1][0])-rectHeight)
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('opacity', data[i][j][3])
          .attr('fill', `rgb(${255*data[i][j][0]}, ${255*data[i][j][1]}, ${255*data[i][j][2]})`);
          
        }
      } 
      return;
    }    
  }

  g2d.Raster.destroy = () => {}

  g2d.Image = async (args, env) => {
    const data = await interpretate(args[0], {...env, context: g2d, nfast:true, numeric:true, image:true});
    const height = data.length;
    const width = data[0].length;
    const rgb = data[0][0].length;
    let ctx;


    if (env.inset) {
      const foreignObject = env.inset.append('foreignObject')
      .attr('width', width)
      .attr('height', height);
    
      const canvas = foreignObject.append('xhtml:canvas')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml');

      ctx = canvas.node().getContext('2d');
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;      
      env.element.appendChild(canvas);
      ctx  = canvas.getContext("2d");
    }
    
    
    // Get a pointer to the current location in the image.

    env.local.ctx = ctx;
    env.local.length = width*height*4;
    env.local.width = width;
    env.local.height = height;
    env.local.rgb = rgb;

    // Wrap your array as a Uint8ClampedArray
    const rgba = new Uint8ClampedArray(width*height*4);
  
    //OH shitty slow Javascript, why...you do not have faster methods
    //TODO: rewrite using webGL!!!
    let index = 0;

    if (!rgb) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j]*255;
          rgba[index+1] = data[i][j]*255;
          rgba[index+2] = data[i][j]*255;
          rgba[index+3] = 255;

          index+=4;
        }
      }  

      ctx.putImageData(new ImageData(rgba, width, height),0,0);
      return;
    }

    if (rgb === 3) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = 255;

          index+=4;
        }
      }
    }

    if (rgb === 4) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = data[i][j][3];

          index+=4;
        }
      }
    }    


    // Repost the data.
    ctx.putImageData(new ImageData(rgba, width, height),0,0);
}

g2d.Image.update = async (args, env) => {
    const data = await interpretate(args[0], {...env, nfast:true, numeric:true, image:true});
    const height = data.length;
    const width = data[0].length;
    const rgb = data[0][0].length;

    const ctx = env.local.ctx;

    // Wrap your array as a Uint8ClampedArray
    const rgba = new Uint8ClampedArray(width*height*4);
  
    //OH shitty slow Javascript, why...you do not have faster methods
    //TODO: rewrite using webGL!!!
    let index = 0;

    if (!rgb) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j]*255;
          rgba[index+1] = data[i][j]*255;
          rgba[index+2] = data[i][j]*255;
          rgba[index+3] = 255;

          index+=4;
        }
      }  

      ctx.putImageData(new ImageData(rgba, width, height),0,0);
      return;
    }

  
    if (rgb === 3) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = 255;

          index+=4;
        }
      }
    }

    if (rgb === 4) {
      for (let i=0; i<height; ++i) {
        for (let j=0; j<width; ++j) {
        
          //what am i doing
          //after years of CUDA and FPGA programming I am writting a loop over an image array
          //shit

          rgba[index+0] = data[i][j][0];
          rgba[index+1] = data[i][j][1];
          rgba[index+2] = data[i][j][2];
          rgba[index+3] = data[i][j][3];

          index+=4;
        }
      }
    }  


    // Repost the data.
    ctx.putImageData(new ImageData(rgba, width, height),0,0);
}

g2d.Image.destroy = (args, env) => interpretate(args[0], env)

core.NumericArray = (args, env) => interpretate(args[0], env)
core.NumericArray.update = core.NumericArray
core.NumericArray.destroy = core.NumericArray
