  import * as dat from 'dat.gui';

  function arrDepth(arr) {
    if (arr.length === 0)                   return 0;
    if (arr[0].length === undefined)        return 1;
    if (arr[0][0].length === undefined)     return 2;
    if (arr[0][0][0].length === undefined)  return 3;
  } 

  core['Charting`DateTicksFunction'] = () => 'DateTicksFunction'
  core['DateListPlot'] = () => {}

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

  const g2dComplex = {};
  g2dComplex.name = "GraphicsComplex 2D"


  interpretate.contextExpand(g2d);

 //polyfill for symbols
 ["FaceForm", "CurrentValue", "FontColor", "Tiny", "VertexColors", "Antialiasing","Small", "Plot",  "ListLinePlot", "ListPlot", "Automatic", "Controls","All","TickLabels","FrameTicksStyle", "AlignmentPoint","AspectRatio","Axes","AxesLabel","AxesOrigin","AxesStyle","Background","BaselinePosition","BaseStyle","ColorOutput","ContentSelectable","CoordinatesToolOptions","DisplayFunction","Epilog","FormatType","Frame","FrameLabel","FrameStyle","FrameTicks","FrameTicksStyle","GridLines","GridLinesStyle","ImageMargins","ImagePadding","ImageSize","ImageSizeRaw","Full","LabelStyle","Method","PlotLabel","PlotRange","PlotRangeClipping","PlotRangePadding","PlotRegion","PreserveImageOptions","Prolog","RotateLabel","Ticks","TicksStyle", "TransitionDuration"].map((name)=>{
  g2d[name] = () => name;
  //g2d[name].destroy = () => name;
  g2d[name].update = () => name;
  
  });

  core.GoldenRatio = () => 1.6180

  g2d["Graphics`Canvas"] = async (args, env) => {
    //const copy = {...env};
    //modify local axes to transform correctly the coordinates of scaled container
    let t = {k: 1, x:0, y:0};
    env.onZoom.push((tranform) => {
      t = tranform;
    });

    const copy = {xAxis: env.xAxis, yAxis: env.yAxis};

    env.xAxis = (x) => {
      return 0;
    };

    env.yAxis = (y) => {
      return 0;
    };

    env.xAxis.invert = (x) => {
      const X = (x - t.x - env.panZoomEntites.left) / t.k;
      return copy.xAxis.invert(X);
    };

    env.yAxis.invert = (y) => {
      const Y = (y - t.y - env.panZoomEntites.top) / t.k;
      return copy.yAxis.invert(Y);
    };

    return env.panZoomEntites.canvas
  }

  g2d.HoldForm = async (args, env) => await interpretate(args[0], env)
  g2d.HoldForm.update = async (args, env) => await interpretate(args[0], env)
  //g2d.HoldForm.destroy = async (args, env) => await interpretate(args[0], env)

  g2d.Scale = async (args, env) => await interpretate(args[0], env)
  g2d.Scale.update = async (args, env) => await interpretate(args[0], env)
  //g2d.Scale.destroy = async (args, env) => await interpretate(args[0], env)  

  g2d.NamespaceBox = async (args, env) => await interpretate(args[1], env)
  g2d.DynamicModuleBox = async (args, env) => await interpretate(args[1], env)
  g2d.TagBox = async (args, env) => await interpretate(args[0], env)  
  g2d.DynamicModule = async (args, env) => await interpretate(args[1], env)
  g2d["Charting`DelayedClickEffect"] = async (args, env) => await interpretate(args[0], env)

  g2d.ColorProfileData = () => {}

  g2d.ParametricPlot = () => {}

  g2d.TransitionDuration = () => "TransitionDuration"
  g2d.TransitionType = () => "TransitionType"

  var assignTransition = (env) => {
    if ('transitiontype' in env) {
      switch (env.transitiontype) {
        case 'Linear':
          env.transitionType = d3.easeLinear
        break;
        case 'CubicInOut':
          env.transitionType = d3.easeCubicInOut
        break;
        default:
          env.transitionType = false;
      }
    }

    if (env.transitionduration) {
      env.transitionDuration = env.transitionduration
    }
  }

  g2d.Offset = async (args, env) => {
    const list = await interpretate(args[1], env);

    /*env.offset = {
      x: env.xAxis(list[0]) - env.xAxis(0),
      y: env.yAxis(list[1]) - env.yAxis(0)
    };*/

    const offset = {
      x: list[0],
      y: list[1]
    };

    const data = await interpretate(args[0], {...env, offset:offset});
    if (Array.isArray(data)) {
      const res = [env.xAxis.invert(data[0]) - env.xAxis.invert(0) + offset.x, env.xAxis.invert(data[1]) + offset.y - env.xAxis.invert(0)];
      return res;
    }

    return data;
  }

  //g2d.Offset.destroy = g2d.Offset
  g2d.Offset.update = g2d.Offset

  g2d.Graphics = async (args, env) => {
    await interpretate.shared.d3.load();
    if (!d3) d3 = interpretate.shared.d3.d3;
    if (!interpolatePath) interpolatePath = interpretate.shared.d3['d3-interpolate-path'].interpolatePath;

    g2d.interpolatePath = interpolatePath;
    g2d.d3 = d3;

    d3.selection.prototype.maybeTransition = function(type, duration) {
      return type ? this.transition().ease(type).duration(duration) : this;
    };

    d3.selection.prototype.maybeTransitionTween = function(type, duration, d, func) {


      return type ? this.transition()
      .ease(type)
      .duration(duration).attrTween(d, func) : this.attr(d, func.apply(this.node(), this.data())(1.0));
    }




    /**
     * @type {Object}
     */  
    let options = await core._getRules(args, {...env, context: g2d, hold:true});


    if (Object.keys(options).length == 0 && args.length > 1) {
      if (args[1][0] === 'List') {
        const opts = args[1].slice(1);
        if (opts[0][0] === 'List') {
          //console.warn(opts[0][1]);
          options = await core._getRules(opts[0].slice(1), {...env, context: g2d, hold:true});
        } else {
          options = await core._getRules(opts, {...env, context: g2d, hold:true});
        }
      } else {
        options = await core._getRules(await interpretate(args[1], {...env, context: g2d, hold:true}), {...env, context: g2d, hold:true});
      }
      
 
    }

    console.log(options);

    let label = options.PlotLabel;

    /**
     * @type {HTMLElement}
     */
    var container = env.element;

    /**
     * @type {[Number, Number]}
     */
    let ImageSize = await interpretate(options.ImageSize, {...env, context: g2d});
    if (typeof ImageSize === 'number') {
      if (ImageSize < 1) {
        ImageSize = 10000.0 * ImageSize / 2.0;
      }
    } else if (typeof ImageSize === 'string'){
      ImageSize = core.DefaultWidth;
    }
    
    if (!ImageSize) {
      if (env.imageSize) {
        if (Array.isArray(env.imageSize)) {
          ImageSize = env.imageSize;
        } else {
          ImageSize = [env.imageSize, env.imageSize*0.618034];
        }
      } else {
        ImageSize = core.DefaultWidth;
      }
    }





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

      ticks = [true, true, true, true];

      //left,right,  bottom,top
      if (Array.isArray(options.FrameTicks)) {
        if (Array.isArray(options.FrameTicks[0])) {
          
          if (Array.isArray(options.FrameTicks[0][0])) {
            
            if (Number.isInteger(options.FrameTicks[0][0][0]) || (typeof options.FrameTicks[0][0] === 'string') || Array.isArray(options.FrameTicks[0][0][0])) {
              ticks[1] = options.FrameTicks[0][0];           
              ticks[3] = options.FrameTicks[0][1];              
              
              //, options.FrameTicks[1][0], options.FrameTicks[0][1], options.FrameTicks[1][1]];
            }
          } else {
            ticks[1] = options.FrameTicks[0][0];           
            ticks[3] = options.FrameTicks[0][1];            
          }
 

        }

        if (Array.isArray(options.FrameTicks[1])) {
          //console.error(options.FrameTicks[1]);
          if (Array.isArray(options.FrameTicks[1][0])) {
            
            if (Number.isInteger(options.FrameTicks[1][0][0]) || (typeof options.FrameTicks[1][0] === 'string') || Array.isArray(options.FrameTicks[1][0][0])) {
              ticks[0] = options.FrameTicks[1][0];
              ticks[2] = options.FrameTicks[1][1];              
              
              //, options.FrameTicks[1][0], options.FrameTicks[0][1], options.FrameTicks[1][1]];
            }
          } else  {
            ticks[0] = options.FrameTicks[1][0];
            ticks[2] = options.FrameTicks[1][1]; 
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
    let margin = {top: 0, right: 0, bottom: 10, left: 40};
    let padding = {top: 0, right: 0, bottom: 15, left: 0}

    if (axis[2]) {
      margin.top = margin.bottom;
      margin.left = margin.right;
    }
    if (options.AxesLabel) {
      padding.bottom = 10;
      margin.top = 30;
      margin.right = 50;
      padding.right = 50;
    }

    if (framed) {
      padding.left = 40;
      padding.left = 30;
      margin.left = 30;
      margin.right = 40;
      margin.top = 30;

      padding.bottom = 10;
      margin.bottom = 35;
    }

    if (options.ImagePadding) {
      console.log('padding: ');
      console.log(options.ImagePadding);
      options.ImagePadding = await interpretate(options.ImagePadding, env);
      console.log(options.ImagePadding);

      if (options.ImagePadding === 'None') {
        margin.top = 0;
        margin.bottom = 0;
        margin.left = 0;
        margin.right = 0;
      } else if (Number.isInteger(options.ImagePadding)) {
        margin.top = options.ImagePadding;
        margin.bottom = options.ImagePadding;
        margin.left = options.ImagePadding;
        margin.right = options.ImagePadding;
      } else if (options.ImagePadding === "All") {

      } else if (options.ImagePadding === false) {
        margin.top = 0;
        margin.bottom = 0;
        margin.left = 0;
        margin.right = 0;        
      }  else {
        console.error('given ImagePadding is not supported!');
      }
    }
    


    let aspectratio = await interpretate(options.AspectRatio, env) || 1;

    

    //if only the width is specified
    if (!(ImageSize instanceof Array)) {
      aspectratio = (aspectratio * (ImageSize - margin.left - margin.right) + margin.top + margin.bottom)/(ImageSize);
      ImageSize = [ImageSize, ImageSize*aspectratio];
    }

    let width = ImageSize[0] - margin.left - margin.right;
    let height = ImageSize[1] - margin.top - margin.bottom;

    if (width <0 || height < 0) {
      //overflow - remove all!
      margin.top = 0;
      margin.bottom = 0;
      margin.left = 0;
      margin.right = 0;
      padding = {top: 0, right: 0, bottom: 0, left: 0};
      width = ImageSize[0];
      height = ImageSize[1];
    }

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
      env.viewBox = boxsize;   

    } else {
      svg.attr("width", width + margin.left + margin.right + padding.left)
         .attr("height", height + margin.top + margin.bottom + padding.bottom);


      env.svgWidth = width + margin.left + margin.right + padding.left;
      env.svgHeight = height + margin.top + margin.bottom + padding.bottom;
    }

    let clipOffset = 0;
    let clipMargin = 2;

    if (framed) {
      clipOffset = 7;
      clipMargin = 0;
    }

    //make it focusable
    svg.attr('tabindex', '0');

    const listenerSVG = svg;
    
    svg = svg  
    .append("g")
      .attr("transform",
            "translate(" + (margin.left + padding.left) + "," + margin.top + ")");

    const clipId = "clp"+(Math.random().toFixed(4).toString().replace('.', ''));
    var clip = svg.append("clipPath")
    .attr("id", clipId)
    .append("rect")
    .attr("width", width - 2 * clipOffset + clipMargin)
    .attr("height", height - 2 * clipOffset + clipMargin)
    .attr("x", clipOffset - clipMargin)
    .attr("y", clipOffset - clipMargin);
    
    let range = [[-1.15,1.15],[-1.15,1.15]];
    let unknownRanges = true;

    if (options.PlotRange || env.plotRange) {
      const r = env.plotRange || (await interpretate(options.PlotRange, env));

      if (Number.isFinite(r[0][0])) {
        if (Number.isFinite(r[1][0])) {
          range = r;
          unknownRanges = false;
        } else {
          range[0] = r[0];
          range[1] = r[0];
        }
      }
    }

    /*if (options.FrameTicks && framed && !options.PlotRange) {
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
        unknownRanges = false;
      }
      console.log(range);
    }*/
    

    let transitionType = d3.easeLinear;

    if (options.TransitionType) {
      const type = await interpretate(options.TransitionType, {...env, context: g2d});
      switch (type) {
        case 'Linear':
          transitionType = d3.easeLinear
        break;
        case 'CubicInOut':
          transitionType = d3.easeCubicInOut
        break;
        default:
          transitionType = undefined;
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
      if (!ticks[0]) {
        xAxis = xAxis.tickValues([]);
      } else {
        if (typeof ticks[0] === 'string') {
          switch(ticks[0]) {
            case 'Automatic':
              break;
            
            case 'None':
              xAxis = xAxis.tickValues([]);
              break;

            case 'DateTicksFunction':
                //convert to a proper format
                x = d3.scaleTime()
                .domain(range[0].map(e => e*1000 - 2208996000*1000))
                .range([ 0, width ]);
                txAxis = d3.axisTop(x);
                xAxis = d3.axisBottom(x);
                const temp = x;
                x = (d) => temp(d*1000 - 2208996000*1000);
                x.copy = temp.copy 
                x.range = temp.range 
                x.domain = temp.domain
                x.invert = temp.invert
              break;


            default:
          }
        } else if (ticks[0] === true) {
          console.log('Default ticks');
        } else if (Array.isArray(ticks[0][0])) {
          const labels = ticks[0].map((el) => el[1]);
          xAxis = xAxis.tickValues(ticks[0].map((el) => el[0])).tickFormat(function (d, i) {
            return labels[i];
          });
        } else {
          xAxis = xAxis.tickValues(ticks[0]);
        }  
      }    
    }

    if (ticks) {
      if (!ticks[2]) {
        txAxis = txAxis.tickValues([]);
      } else {
        if (typeof ticks[2] === 'string') {
          switch(ticks[2]) {
            case 'Automatic':
              break;
            
            case 'None':
              txAxis = txAxis.tickValues([]);
              break;

            case 'DateTicksFunction':
                x = d3.scaleTime()
                .domain(range[0].map(e => e*1000 - 2208996000*1000))
                .range([ 0, width ]);
                txAxis = d3.axisTop(x).ticks(4);
                xAxis = d3.axisBottom(x).ticks(4);
                const temp = x;
                x = (d) => temp(d*1000 - 2208996000*1000);
                x.copy = temp.copy 
                x.range = temp.range 
                x.domain = temp.domain
                x.invert = temp.invert
              break;


            default:
          }
        } else if (ticks[2] === true) {
          console.log('Default ticks');
        } else if (Array.isArray(ticks[2][0])) {
          const labels = ticks[2].map((el) => el[1]);
          txAxis = txAxis.tickValues(ticks[2].map((el) => el[0])).tickFormat(function (d, i) {
            return labels[i];
          });
        } else {
          txAxis = txAxis.tickValues(ticks[2]);
        }  
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
      if (!ticks[1]) {
        yAxis = yAxis.tickValues([]);
      } else {
        if (typeof ticks[1] === 'string') {
          switch(ticks[1]) {
            case 'Automatic':
              break;
            
            case 'None':
              yAxis = yAxis.tickValues([]);
              break;

            case 'DateTicksFunction':
              y = d3.scaleTime()
              .domain(range[1].map(e => e*1000 - 2208996000*1000))
              .range([ 0, height ]);
              ryAxis = d3.axisRight(y);
              yAxis = d3.axisLeft(y);

              const proxy = y;
              y = (d) => proxy(d*1000 - 2208996000*1000);
              y.copy = proxy.copy 
              y.range = proxy.range 
              y.domain = proxy.domain
              y.invert = proxy.invert             
              break;


            default:
          }
        } else if (ticks[1] === true) {
          console.log('Default ticks');
        } else if (Array.isArray(ticks[1][0])) {
          const labels = ticks[1].map((el) => el[1]);
          yAxis = yAxis.tickValues(ticks[1].map((el) => el[0])).tickFormat(function (d, i) {
            return labels[i];
          });
        } else {
          yAxis = yAxis.tickValues(ticks[1]);
        }  
      }    
    }

    if (ticks) {
      if (!ticks[3]) {
        ryAxis = ryAxis.tickValues([]);
      } else {
        if (typeof ticks[3] === 'string') {
          switch(ticks[3]) {
            case 'Automatic':
              break;
            
            case 'None':
              ryAxis = ryAxis.tickValues([]);
              break;

            case 'DateTicksFunction':
              y = d3.scaleTime()
              .domain(range[1].map(e => e*1000 - 2208996000*1000))
              .range([ 0, height ]);
              ryAxis = d3.axisRight(y);
              yAxis = d3.axisLeft(y);

              const proxy = y;
              y = (d) => proxy(d*1000 - 2208996000*1000);
              y.copy = proxy.copy 
              y.range = proxy.range 
              y.domain = proxy.domain
              y.invert = proxy.invert 
              break;


            default:
          }
        } else if (ticks[3] === true) {
          console.log('Default ticks');
        } else if (Array.isArray(ticks[3][0])) {
          const labels = ticks[3].map((el) => el[1]);
          ryAxis = ryAxis.tickValues(ticks[3].map((el) => el[0])).tickFormat(function (d, i) {
            return labels[i];
          });
        } else {
          ryAxis = ryAxis.tickValues(ticks[3]);
        }  
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

    //added clip view
    env.svg = env.svg.attr("clip-path", "url(#"+clipId+")").append('g');

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
    env.arrowHead = 1.0;
    env.onZoom = [];
    env.transitionDuration = 50;
    env.transitionType = transitionType;

    env.plotRange = range;

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



    let labelStyle = {...env};

    if (options.LabelStyle) {
      await interpretate(options.LabelStyle, labelStyle);
    }

    if (label) {
      label = await interpretate(label, labelStyle);
      svg.append("text")
              .attr("x", (width / 2) + labelStyle.offset.x)             
              .attr("y", 0 - (margin.top / 2) + labelStyle.offset.y)
              .attr("text-anchor", "middle") 
              .attr('fill', labelStyle.color)
              .style("font-size", labelStyle.fontsize)  
              .style("font-family", labelStyle.fontfamily)  
              .text(label);
    }

    if (options.AxesLabel && !framed) {
      
      options.AxesLabel = await interpretate(options.AxesLabel, {...env, hold:true});

      if (Array.isArray(options.AxesLabel)) {
        let temp = {...env};
        let value = await interpretate(options.AxesLabel[0], temp);
        if (value != 'None' && gX) {
          g2d.Text.PutText(gX.append("text")
          .attr("x", width + temp.offset.x + 10)
          .attr("y", margin.bottom + temp.offset.y)
          .attr("font-size", axesstyle.fontsize)
          .attr("fill", axesstyle.color)
          .attr("text-anchor", "start")
          , value, axesstyle); 
        }

        temp = {...env};
        value = await interpretate(options.AxesLabel[1], temp);        
        if (value != 'None' && gY) {
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
     
      //throw(options.FrameLabel);

      options.FrameLabel = await interpretate(options.FrameLabel, {...env});



      if (Array.isArray(options.FrameLabel)) {

        let lb = options.FrameLabel[0];
        let rt = options.FrameLabel[1];

        if (typeof lb == "string") {
          const copy = [lb,rt];
          lb = [copy[1], "None"];
          rt = [copy[0], "None"];
        }

        
        let temp;
        let value;

      if (lb != 'None' && lb) {
        temp = {...env};
        value = lb[0];

        if (value != 'None' && gY) {
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
        value = lb[1];

        if (value != 'None' && gRY) {
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
        value = rt[1];      
        
        if (value != 'None' && gTX) {
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
        value = rt[0];        

        if (value != 'None' && gX) {
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
        env.transitionDuration = await interpretate(options.TransitionDuration, env);
      }

      env.local.xAxis = x;
      env.local.yAxis = y;

      if (options.Controls || (typeof options.Controls === 'undefined')) {
        //add pan and zoom
        if (typeof options.Controls === 'undefined') {
          addPanZoom(listenerSVG, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env);
        } else {
          if (await interpretate(options.Controls, env))
            addPanZoom(listenerSVG, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env);
        }
      }



      env.panZoomEntites = {
        canvas: listenerSVG,
        svg: env.svg,
        left: margin.left + padding.left,
        top: margin.top,
        gX: gX,
        gY: gY,
        gTX: gTX,
        gRY: gRY,
        xAxis: xAxis,
        yAxis: yAxis,
        txAxis: txAxis,
        ryAxis: ryAxis,
        x: x,
        y: y
      };

      if (!env.inset) {

        //Setting GUI
        const gui = new dat.GUI({ autoPlace: false, name: '...' , closed:true});

        const guiContainer = document.createElement('div');
        guiContainer.classList.add('graphics2d-controller');
        guiContainer.appendChild(gui.domElement);  
      
        const button = { Save:function(){ 
          saveFile(serialize(container.firstChild), "plot.svg");
        }};
        gui.add(button, 'Save');        

        env.element.appendChild(guiContainer);
      }

      const instancesKeys = Object.keys(env.global.stack);

      await interpretate(options.Prolog, env); 

      
      await interpretate(args[0], env);
      interpretate(options.Epilog, env);

      if (unknownRanges) {
        if (env.reRendered) {
          console.error('Something is wrong with ranges. We could not determine them properly');
          console.warn(env);
          return;
        }

        svg.node().style.opacity = 0;
        console.warn('d3.js autoscale! Requires double evaluation!!!');
        //credits https://gist.github.com/mootari
        //thank you, nice guy
        
        

        const xsize = ImageSize[0] - (margin.left + margin.right);
        const ysize = ImageSize[1] - (margin.top + margin.bottom);

        let box = env.svg.node().getBBox();

        console.log([xsize, ysize]);
        console.log(box);

        const plotRange = [[x.invert(box.x), x.invert(box.x + box.width)], [y.invert(box.height+box.y), y.invert(box.height+box.y - box.height)]];

        console.log(plotRange);
        console.warn('Kill all created instances');
        const created = Object.keys(env.global.stack).filter((i) => !instancesKeys.some(o => o === i));

        for (const i of created) {
          env.global.stack[i].dispose();
        }

        svg.remove();
        container.replaceChildren();

        return await g2d.Graphics(args, {...env, plotRange: plotRange, reRendered:true});
        
        if (!box.width) {
          console.warn('Warning! Looks like an element was not drawn properly');
          box.width = ImageSize[0];
          box.height = ImageSize[0];
          box.x = 0;
          box.y = 0;
          console.log(box);
        }



        console.log(box);

        /*
        const scale = Math.min(xsize / box.width, ysize / box.height);

        console.log(scale);
        
        // Reset transform.
        let transform = d3.zoomTransform(listenerSVG);
        

        
        // Center [0, 0].
        transform = transform.translate(xsize / 2, ysize / 2);
        // Apply scale.
        transform = transform.scale(scale);
        // Center elements.
        transform = transform.translate(-box.x - box.width / 2, -box.y - box.height / 2);

        console.log(transform);
       
        
        reScale(transform, svg, env.svg, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env);

        if (env._zoom) {
          env._zoom.transform(listenerSVG, transform);
        }        */

        
      }
  }

  const reScale = (transform, raw, view, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y) => {
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

  const icoExport = `<svg fill="currentColor" width="16" height="16" viewBox="0 0 1920 1920"><path d="M790.706 338.824v112.94H395.412c-31.06 0-56.47 25.3-56.47 56.471v744.509c17.73-6.325 36.592-10.391 56.47-10.391h1129.412c19.877 0 38.738 4.066 56.47 10.39V508.236c0-31.171-25.412-56.47-56.47-56.47h-395.295V338.824h395.295c93.402 0 169.411 76.009 169.411 169.411v1242.353c0 93.403-76.01 169.412-169.411 169.412H395.412C302.009 1920 226 1843.99 226 1750.588V508.235c0-93.402 76.01-169.411 169.412-169.411h395.294Zm734.118 1016.47H395.412c-31.06 0-56.47 25.299-56.47 56.47v338.824c0 31.172 25.41 56.47 56.47 56.47h1129.412c31.058 0 56.47-25.298 56.47-56.47v-338.823c0-31.172-25.412-56.47-56.47-56.47ZM1016.622-.023v880.151l246.212-246.325 79.85 79.85-382.532 382.644-382.645-382.644 79.85-79.85L903.68 880.128V-.022h112.941ZM564.824 1468.235c-62.344 0-112.942 50.71-112.942 112.941s50.598 112.942 112.942 112.942c62.343 0 112.94-50.71 112.94-112.942 0-62.23-50.597-112.94-112.94-112.94Z" fill-rule="evenodd"/></svg>`

  g2d.Graphics.update = (args, env) => { console.error('root update method for Graphics is not supported'); }
  g2d.Graphics.destroy = (args, env) => { console.error('Nothing to destroy...'); }

  g2d.JoinForm = (args, env) => {
    env.joinform = interpretate(args[0], env);
    console.warn('JoinForm is not implemented!');
  }

  const curve = {};
  curve.BezierCurve = async (args, env) => {
    let points = await interpretate(args[0], env);
    var path = env.path; 

    const x = env.xAxis;
    const y = env.yAxis;

    points = points.map((p) => [x(p[0]), y(p[1])]);

    let indexLeft = points.length - 1;

    if (env.startQ) {
      path.moveTo(...points[0]);
    
      for (let i=1; i<points.length - 2; i+=3) {
          indexLeft -= 3;
          path.bezierCurveTo(...points[i], ...points[i+1], ...points[i+2]) 
      }

      env.startQ = false;
    } else {
      //path.moveTo(...points[0]);
    
      for (let i=0; i<points.length - 2; i+=3) {
          indexLeft -= 3;
          path.bezierCurveTo(...points[i], ...points[i+1], ...points[i+2]) 
      }     
    }


    if (indexLeft > 0) {
      path.quadraticCurveTo(...points[points.length - 2], ...points[points.length -1]);
    }    
  } 

  curve.Line = async (args, env) => {
    let points = await interpretate(args[0], env);
    var path = env.path; 

    const x = env.xAxis;
    const y = env.yAxis;

    points = points.map((p) => [x(p[0]), y(p[1])]);

    if (env.startQ) {
      path.moveTo(...points[0]);
      for (let i =1; i<points.length; ++i)
        path.lineTo(...points[i]);      

      env.startQ = false;

      return;
    }

    for (let i =0; i<points.length; ++i)
      path.lineTo(...points[i]);

  }

  g2d.JoinedCurve = async (args, env) => {
    const path = d3.path();
    await interpretate(args[0], {...env, path: path, context: [curve, g2d], startQ: true});
    
    return env.svg.append("path")
    .attr("fill", "none")
    .attr("vector-effect", "non-scaling-stroke")
    .attr('opacity', env.opacity)
    .attr("stroke", env.color)
    .attr("stroke-width", env.strokeWidth)
    .attr("d", path); 
  }  

  g2d.CapForm = () => {}

  g2d.FilledCurve = async (args, env) => {
    const path = d3.path();
    await interpretate(args[0], {...env, path: path, context: [curve, g2d], startQ: true});
    
    return env.svg.append("path")
    .attr("fill", env.color)
    .attr("vector-effect", "non-scaling-stroke")
    .attr('opacity', env.opacity)
    .attr('fill-rule', 'evenodd')
    .attr("stroke", 'none')
    .attr("stroke-width", env.strokeWidth)
    .attr("d", path); 
  }

  g2d.Inset = async (args, env) => {
    let pos = [0,0];
    let size; 
    
    if (args.length > 1) pos = await interpretate(args[1], env);
    let opos;

    if (args.length > 2) opos = await interpretate(args[2], env);
    if (args.length > 3) size = await interpretate(args[3], env);

    const group = env.svg.append('g');
    const copy = {global: env.global, inset: group};

    if (size) {
      //copy.imageSize = size;
    } 
   
    const instance = new ExecutableObject('feinset-'+uuidv4(), copy, args[0]);
    instance.assignScope(copy);
  
    await instance.execute();    
  
    env.local.group = group;
    const bbox = group.node().getBoundingClientRect();
    if (!opos) {
      opos = [bbox.width/2, bbox.height/2];
    } else {
      opos = [0,0]
    }

    console.log(bbox);
    let scale = 1;

    if (size) {
      if (typeof size === 'number') size = [size, size/1.6];
      size = [Math.abs(env.xAxis(size[0]) - env.xAxis(0)), Math.abs(env.yAxis(size[1]) - env.yAxis(0))];
      console.log(size);
      scale = size[0] / bbox.width;
    }

    

    const vbox = group.node().getBBox();



    const cx = vbox.x + (vbox.width / 2) ;
    const cy = vbox.y + (vbox.height / 2) ;
    const zx = cx - scale * cx ;
    const zy = cy - scale * cy;

    env.local.bbox = bbox;
    env.local.opos = opos;
    env.local.scale = scale;
    env.local.matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + zx + ', ' + zy + ')';

    const xx =(   env.xAxis(pos[0]) - env.xAxis(0) ) / scale   + (bbox.width/2 - opos[0]);
    const yy =  (   env.yAxis(pos[1]) - env.yAxis(0) ) /scale   + (bbox.height/2 - opos[1]);

    return group.attr('transform', env.local.matrix + ' translate(' + xx + ',' + yy + ')');
  }

  g2d.Inset.update = async (args, env) => {
    const pos = await interpretate(args[1], env);

    const xx =(   env.xAxis(pos[0]) - env.xAxis(0) ) / env.local.scale   + (env.local.bbox.width/2 - env.local.opos[0]);
    const yy =  (   env.yAxis(pos[1]) - env.yAxis(0) ) /env.local.scale   + (env.local.bbox.height/2 - env.local.opos[1]);

    return env.local.group.attr('transform', env.local.matrix + ' translate(' + xx + ',' + yy + ')');
   
  }

  g2d.Inset.destroy = async (args, env) => {
    console.warn('Destory method is not defined for Inset');
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

  const addPanZoom = (listener, raw, view, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env) => {

      console.log({listener, raw, view, gX, gY, gTX, gRY, xAxis, yAxis, txAxis, ryAxis, x, y, env});
      const zoom = d3.zoom().filter(filter).on("zoom", zoomed);
   
      listener.call(zoom);
      
      env._zoom = zoom;

      

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
        
        env.onZoom.forEach((h)=>{
          h(transform)
        });
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
    let obj = env.local.object.maybeTransition(env.transitionType, env.transitionDuration);
    
    Object.keys(attrs).forEach((a)=> {
      obj = obj.attr(a, attrs[a]);
    });

    return obj;
  }  

  g2d.SVGAttribute.destroy = async (args, env) => {
    console.log('SVGAttribute: nothing to destroy');
  }

  g2d.SVGAttribute.virtual = true;

  import labToRgb from '@fantasy-color/lab-to-rgb'


  g2d.LABColor =  async (args, env) => {
    let lab;
    if (args.length > 1)
      lab = [await interpretate(args[0], env), await interpretate(args[1], env), await interpretate(args[2], env)];
    else 
      lab = await interpretate(args[0], env);

    
    const color = labToRgb({luminance: 100*lab[0], a: 100*lab[1], b: 100*lab[2]});
    console.log(lab);
    console.log('LAB color');
    console.log(color);
    
    env.color = "rgb("+Math.floor(color.red)+","+Math.floor(color.green)+","+Math.floor(color.blue)+")";
    if (args.length > 3) env.opacity = await interpretate(args[3], env);
    
    return env.color;   
  }

  g2d.LABColor.update = () => {}
 // g2d.LABColor.destroy = () => {}

 g2d.arrowGenerator = undefined

 let arrow1;

 g2dComplex.Arrow = async (args, env) => {
  await interpretate.shared.d3.load();
  if (!arrow1) arrow1 = (await interpretate.shared.d3['d3-arrow']).arrow1;

  let data = await interpretate(args[0], env);

  if (!Array.isArray(data)) {
    //if not a numerical data, but some other curves
    let object;
    const uid = uuidv4();
    const arrow = arrow1()
    .id(uid)
    .attr("fill", env.color)
    .attr("stroke", "none").scale([env.arrowHead]);
  
    env.svg.call(arrow);

    object = data.attr("marker-end", "url(#"+uid+")");

    return object;
  }

  const x = env.xAxis;
  const y = env.yAxis;

  //difference case for verices
  //console.warn(data);
  if (!data[0][0]) {
      const uid = uuidv4();
      const arrow = arrow1()
      .id(uid)
      .attr("fill", env.color)
      .attr("stroke", "none").scale([env.arrowHead]);
    
      env.svg.call(arrow);

 

      const object = env.svg.append("path")
      .datum(data.map((index) => env.vertices[index-1]))
      .attr("fill", "none")
      .attr("vector-effect", "non-scaling-stroke")
      .attr('opacity', env.opacity)
      .attr("stroke", env.color)
      .attr("stroke-width", env.strokeWidth)
      .attr("d", d3.line()
        .x(function(d) { return x(d[0]) })
        .y(function(d) { return y(d[1]) })
        ).attr("marker-end", "url(#"+uid+")"); 

      return object;
    } else {

      console.log('Multiple isntances');
      console.log(data);

      const gr = env.svg.append("g");
      gr.attr("fill", "none")
      .attr('opacity', env.opacity)
      .attr("stroke", env.color)
      .attr("stroke-width", env.strokeWidth);

      const uid = uuidv4();
      const arrow = arrow1()
      .id(uid)
      .attr("fill", env.color)
      .attr("stroke", "none").scale([env.arrowHead]);
      env.svg.call(arrow);  

      data.forEach((dt) => {
              
        const object = gr.append("path")
        .datum(dt.map((index) => env.vertices[index-1]))
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          ).attr("marker-end", "url(#"+uid+")"); ; 
      });

      return gr;
    }
 }

 g2d.Arrow = async (args, env) => {
   await interpretate.shared.d3.load();
   if (!arrow1) arrow1 = (await interpretate.shared.d3['d3-arrow']).arrow1;

   const x = env.xAxis;
   const y = env.yAxis;

   const uid = uuidv4();
   const arrow = arrow1()
   .id(uid)
   .attr("fill", env.color)
   .attr("stroke", "none").scale([env.arrowHead]);

   env.svg.call(arrow);

   const path = await interpretate(args[0], env);

   if (!Array.isArray(path)) {
    //if not a numerical data, but some other curves
    let object;

    object = path.attr("marker-end", "url(#"+uid+")");

    return object;
  }

   env.local.line = d3.line()
     .x(function(d) { return env.xAxis(d[0]) })
     .y(function(d) { return env.yAxis(d[1]) });

  if (!path[0][0][0]) {

     const object = env.svg.append("path")
     .datum(path)
     .attr("vector-effect", "non-scaling-stroke")
     .attr("fill", "none")
     .attr('opacity', env.opacity)
     .attr("stroke", env.color)
     .attr("stroke-width", env.strokeWidth)
     .attr("d", env.local.line
     ).attr("marker-end", "url(#"+uid+")"); 

     env.local.arrow = object;

     if (env.colorRefs) {
      env.colorRefs[env.root.uid] = env.root;
    }
    if (env.opacityRefs) {
      env.opacityRefs[env.root.uid] = env.root;
    }
   
     return object;
  } else {
    const object = [];

    path.forEach((p) => {
      object.push(env.svg.append("path")
      .datum(p)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("fill", "none")
      .attr('opacity', env.opacity)
      .attr("stroke", env.color)
      .attr("stroke-width", env.strokeWidth)
      .attr("d", env.local.line
      ).attr("marker-end", "url(#"+uid+")"))
    });


    env.local.arrows = object;

    return object;

  }



 }

 g2d.Arrow.update = async (args, env) => {
   const x = env.xAxis;
   const y = env.yAxis;


   const path = await interpretate(args[0], env);
   if (path[0][0][0]) throw('Arrows update method does not support multiple traces');

   //console.log(env.local);

   const object = env.local.arrow.datum(path).maybeTransitionTween(env.TransitionType, env.TransitionDuration, 'd', function (d) {
    var previous = d3.select(this).attr('d');
    var current = env.local.line(d);
    return interpolatePath(previous, current);
  });
   
   return object;
 }

 g2d.Arrow.updateColor = (args, env) => {
  env.local.arrow.attr("stroke", env.color);
 }

  g2d.Arrow.updateOpacity = (args, env) => {
    env.local.arrow.attr("opacity", env.opacity);
  }

 g2d.Arrow.virtual = true

 g2d.Arrow.destroy = async (args, env) => {
  if (env.colorRefs) {
    delete env.colorRefs[env.root.uid];
  }
 }  

 g2d.ImageScaled = async (args, env) => {
    const offset = await interpretate(args[0], env);
    return [
      offset[0] * (env.plotRange[0][1] - env.plotRange[0][0]) + env.plotRange[0][0],
      offset[1] * (env.plotRange[1][1] - env.plotRange[1][0]) + env.plotRange[1][0]
    ];
 }

  g2d.Arrowheads = async (args, env) => {
    const head = (await interpretate(args[0], env));
    if (Array.isArray(head)) {
      env.arrowHead = 10.0*(head.flat())[0];
    } else {
      env.arrowHead = 10.0*head;
    }
  }

  //g2d.Arrowheads.destroy = async () => {};

  //g2d.Arrow.destroy = async () => {}  

  g2d.Text = async (args, env) => {
    const text = await interpretate(args[0], env);
    const coords = await interpretate(args[1], env);


    env.local.text = text;

    let globalOffset = {x: 0, y: 0};
    if (env.offset) {
      globalOffset = env.offset;
    }

    const object = env.svg.append('text')
      .attr("font-family", env.fontfamily)
      .attr("font-size", env.fontsize)
      .attr("fill", env.color);

    //(args);

    if (args.length > 2) {
      
      const offset = (await interpretate(args[2], {...env, plotRange:[[-1,1], [-1,1]]})).map((el => Math.round(el)));

      console.warn('OFFSET');
      console.warn(offset);

      if (env.offset) {
        globalOffset = env.offset;
      }

      //console.error(offset);
      //console.error(globalOffset);


      object
      .attr("x", env.xAxis(coords[0] ) + globalOffset.x )
      .attr("y", env.yAxis(coords[1] ) + globalOffset.y );

      if (offset[0] === 0 && offset[1] === 0) {
        object.attr("text-anchor", "middle");
      } else if (offset[0] === -1) {
        object.attr("text-anchor", "start");
      } else if (offset[0] === 1) {
        object.attr("text-anchor", "end");
      } else {
        console.warn(offset);
        console.error('Unknown anchor');
      }

    } else {

      object
      .attr("x", env.xAxis(coords[0]) + globalOffset.x)
      .attr("y", env.yAxis(coords[1]) + globalOffset.y);

    }

    g2d.Text.PutText(object, text, env);

    env.local.object = object;

    if (env.colorRefs) {
      env.colorRefs[env.root.uid] = env.root;
    }
    if (env.opacityRefs) {
      env.opacityRefs[env.root.uid] = env.root;
    }

    return object;
  }

  g2d.Text.PutText = (object, raw, env) => {
    //parse the text
    if (!raw) return;
    let text = raw;
    if (typeof raw === 'number') text = raw.toString();

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

  g2d.Text.updateColor = (args, env) => {
    env.local.object.attr("fill", env.color);
  }

  g2d.Text.updateOpacity = (args, env) => {
    env.local.object.attr("opacity", env.opacity);
  }  

  g2d.Text.update = async (args, env) => {
    const text = await interpretate(args[0], env);
    const coords = await interpretate(args[1], env);

    let trans;

    if (env.local.text != text) {
      trans = env.local.object
      .maybeTransition(env.transitionType, env.transitionDuration)
      .text(text)
      .attr("x", env.xAxis(coords[0]))
      .attr("y", env.yAxis(coords[1]))
      .attr("fill", env.color);
    } else {
      trans = env.local.object
      .maybeTransition(env.transitionType, env.transitionDuration)
      .attr("x", env.xAxis(coords[0]))
      .attr("y", env.yAxis(coords[1]))
      .attr("fill", env.color);
    }



    return trans;
  }   


  g2d.Text.destroy = (args, env) => {
    console.log('Nothing to destory');
    if (env.colorRefs) {
      delete env.colorRefs[env.root.uid];
    }
    if (env.opacityRefs) {
      delete env.opacityRefs[env.root.uid];
    }
  }


  //g2d.Text.destroy = async (args, env) => {
    //for (const o of args) {
      //await interpretate(o, env);
    //}
  //}

  //transformation context to convert fractions and etc to SVG form
  g2d.Text.subcontext = {}
  //TODO

  g2d.FontSize = () => "FontSize"
  //g2d.FontSize.destroy = g2d.FontSize
  g2d.FontSize.update = g2d.FontSize
  g2d.FontFamily = () => "FontFamily"
  //g2d.FontFamily.destroy = g2d.FontFamily
  g2d.FontFamily.update = g2d.FontFamily
  
  g2d.Style = async (args, env) => {
    const copy = env;
    const options = await core._getRules(args, env);
    
    if (options.FontSize) {
      copy.fontsize = options.FontSize;
    }  

    if (options.FontColor) {
      copy.color = options.FontColor;
    }
  
    if (options.FontFamily) {
      copy.fontfamily = options.FontFamily
    } 

    for(let i=1; i<(args.length - Object.keys(options).length); ++i) {
      await interpretate(args[i], copy);
    }
  
    return await interpretate(args[0], copy);
  }

  //g2d.Style.destroy = async (args, env) => {
    //const options = await core._getRules(args, env);  
   // return await interpretate(args[0], env);
  //}  
  
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

  g2d.AnimationFrameListener = async (args, env) => {
    const dummy = await interpretate(args[0], env);
    const options = await core._getRules(args, {...env, hold:true});
    env.local.event = await interpretate(options.Event, env);
    env.local.fire = () => {
      server.kernel.emitt(env.local.event, 'True', 'Frame');
    }

    window.requestAnimationFrame(env.local.fire);
  }

  g2d.AnimationFrameListener.update = async (args, env) => {
    window.requestAnimationFrame(env.local.fire);
  }

  g2d.AnimationFrameListener.destroy = async (args, env) => {
    console.warn('AnimationFrameListener does not exist anymore');
  }

  g2d.AnimationFrameListener.virtual = true

  

  g2d.GraphicsComplex = async (args, env) => {
    const vertices = await interpretate(args[0], env);
    const opts = await core._getRules(args, env);
    const copy = {...env, vertices: vertices, context: [g2dComplex, g2d]};

    if (opts.VertexColors) {
      copy.vertexColors = opts.VertexColors;
    }

    return await interpretate(args[1], copy);
  }

  g2d.GraphicsComplex.update = () => {
    throw('Updates of GraphicsComplex are not supported!');
  }

  g2d.GraphicsComplex.destroy = () => {
    console.log('Nothing to destroy');
  }

  g2d.GraphicsComplex.virtual = true; //local memory for updates

  //g2d.GraphicsComplex.destroy = async (args, env) => {
    //await interpretate(args[0], env);
    //await interpretate(args[1], env);
  //}

  g2d.Medium = () => 0.8/10.0;
  g2d.Large = () => 1.1/10.0;
  g2d.Small = () => 0.25/10.0;

  g2d.GraphicsGroup = async (args, env) => {
    return await interpretate(args[0], env);
  }

  g2d.GraphicsGroup.update = async (args, env) => {
    return await interpretate(args[0], env);
  }  

  //g2d.GraphicsGroup.destroy = async (args, env) => {
    //await interpretate(args[0], env);
  //}  

  g2d.Thickness = () => {}

  g2d.AbsoluteThickness = (args, env) => {
    env.strokeWidth = interpretate(args[0], env);
  }

  g2d.PointSize = async (args, env) => {
    env.pointSize = await interpretate(args[0], env);
  }

  g2d.Annotation = core.List;

  g2d.ZoomAt = async (args, env) => {
    let zoom = await interpretate(args[0], env);
    let translate = [0,0];
    if (args.length > 1) {
      translate = await interpretate(args[1], env);
    }

    translate = [env.xAxis(translate[0]) - env.xAxis(0), env.yAxis(translate[1]) - env.yAxis(0)];
    console.log(translate);

    const o = env.panZoomEntites;

    console.log(env.svg.attr('transform'));
    const dims = env.svg.node().getBBox();
    const transform = d3.zoomIdentity.translate(dims.width/2, dims.height/2).scale(zoom).translate(-dims.width/2 - translate[0], -dims.height/2 - translate[1]);
    

    o.svg.maybeTransition(env.transitionType, env.transitionDuration).attr("transform", transform);
    if (o.gX)
      o.gX.maybeTransition(env.transitionType, env.transitionDuration).call(o.xAxis.scale(transform.rescaleX(o.x)));
    if (o.gY)
      o.gY.maybeTransition(env.transitionType, env.transitionDuration).call(o.yAxis.scale(transform.rescaleY(o.y)));

    if (o.gTX)
      o.gTX.maybeTransition(env.transitionType, env.transitionDuration).call(o.txAxis.scale(transform.rescaleX(o.x)));
    if (o.gRY)
      o.gRY.maybeTransition(env.transitionType, env.transitionDuration).call(o.ryAxis.scale(transform.rescaleY(o.y))); 

    //env.svg.maybeTransition(env.transitionType, env.transitionDuration).call(
      


  }

  const rescaleRanges = (ranges, old, o, env) => {
    throw('not implemented');
    const target = [ranges[0].map((e) => o.xAxis(e)), ranges[1].map((e) => o.yAxis(e))];
    const prev   = [old[0].map((e) => o.xAxis(e)), old[1].map((e) => o.yAxis(e))];

    console.log({target, prev});

    const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(40).translate(-x, -y);

    o.svg.attr("transform", transform)
    if (o.gX)
      o.gX.call(o.xAxis.scale(transform.rescaleX(o.x)));
    if (gY)
      o.gY.call(o.yAxis.scale(transform.rescaleY(o.y)));

    if (o.gTX)
      o.gTX.call(o.txAxis.scale(transform.rescaleX(o.x)));
    if (o.gRY)
      o.gRY.call(o.ryAxis.scale(transform.rescaleY(o.y))); 
  }

  g2d.Directive = async (args, env) => {
    const opts = await core._getRules(args, env);
    for (const o of Object.keys(opts)) {
      env[o.toLowerCase()] = opts[o];
    }

    //rebuild transition structure
    assignTransition(env);

    if ('PlotRange' in opts) {
      //recalculate the plot range
      const ranges = opts.PlotRange;
      rescaleRanges(ranges, env.plotRange, env.panZoomEntites);
    }

    for (let i=0; i<(args.length - Object.keys(opts).length); ++i) {
      await interpretate(args[i], env);
    }
  }

  //g2d.Directive.destroy = g2d.Directive

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

  //g2d.EdgeForm.destroy = async (args, env) => {

  //}

  g2d.Opacity = async (args, env) => {
    env.opacity = await interpretate(args[0], env);
    env.exposed.opacity = env.opacity;

    if (env.root.child) {
      console.log('Dynamic env variable caught');

      const refs = {};
      env.exposed.opacityRefs = refs;
      env.local.refs = refs;
    }
    return env.opacity;
  }

  g2d.Opacity.update = async (args, env) => {
    const opacity = await interpretate(args[0], env);
    //update all mentioned refs
    const refs = Object.values(env.local.refs);
    for (const r of refs) {
      r.execute({method: 'updateOpacity', opacity: opacity})
    }
  }

  g2d.Opacity.destroy = (args, env) => {
    delete env.local.refs;
    //delete env.local;
  }  

  g2d.Opacity.virtual = true;

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
    let colorCss;

    if (args.length == 3) {
      const color = [];
      colorCss = "rgb(";
      colorCss += String(Math.floor(255 * (await interpretate(args[0], env)))) + ",";
      colorCss += String(Math.floor(255 * (await interpretate(args[1], env)))) + ",";
      colorCss += String(Math.floor(255 * (await interpretate(args[2], env)))) + ")";

    } else {
      const a = await interpretate(args[0], env);
      colorCss = "rgb(";
      colorCss += String(Math.floor(255 * a[0])) + ",";
      colorCss += String(Math.floor(255 * a[1])) + ",";
      colorCss += String(Math.floor(255 * a[2])) + ")";      
    }

    if (env.root.child) {
      console.log('Dynamic env variable caught');

      const refs = {};
      env.exposed.colorRefs = refs;
      env.local.refs = refs;
    }

    env.exposed.color = colorCss;

  

    return env.color;
  }

  g2d.RGBColor.update = async (args, env) => {
    let colorCss;

    if (args.length == 3) {
      const color = [];
      colorCss = "rgb(";
      colorCss += String(Math.floor(255 * (await interpretate(args[0], env)))) + ",";
      colorCss += String(Math.floor(255 * (await interpretate(args[1], env)))) + ",";
      colorCss += String(Math.floor(255 * (await interpretate(args[2], env)))) + ")";

    } else {
      const a = await interpretate(args[0], env);
      colorCss = "rgb(";
      colorCss += String(Math.floor(255 * a[0])) + ",";
      colorCss += String(Math.floor(255 * a[1])) + ",";
      colorCss += String(Math.floor(255 * a[2])) + ")";      
    }
    

    //update all mentioned refs
    const refs = Object.values(env.local.refs);
    for (const r of refs) {
      r.execute({method: 'updateColor', color: colorCss})
    }
  }

  g2d.RGBColor.destroy = (args, env) => {
    delete env.local.refs;
    //delete env.local;
  }

  //hope it wont lag anythting
  g2d.RGBColor.virtual = true



  //g2d.RGBColor.destroy = (args, env) => {}
  //g2d.Opacity.destroy = (args, env) => {}
  //g2d.GrayLevel.destroy = (args, env) => {}
  
  //g2d.PointSize.destroy = (args, env) => {}
  //g2d.AbsoluteThickness.destroy = (args, env) => {}
  let hsv2hsl = (h,s,v,l=v-v*s/2, m=Math.min(l,1-l)) => [h,m?(v-l)/m:0,l];

  g2d.Hue = async (args, env) => {
      let color = await Promise.all(args.map(el => interpretate(el, env)));
      if (color.length < 3) {
        color = [color[0], 1,1];
      }
      color = hsv2hsl(...color);
      color = [color[0], (color[1]*100).toFixed(2), (color[2]*100).toFixed(2)];

      env.color = "hsl("+(3.14*100*color[0]).toFixed(2)+","+color[1]+"%,"+color[2]+"%)";

      if (env.root.child) {
        console.log('Dynamic env variable caught');
  
        const refs = {};
        env.exposed.colorRefs = refs;
        env.local.refs = refs;
      }
  
      env.exposed.color = env.color;

  } 

  g2d.Hue.update = async (args, env) => {
    let color = await Promise.all(args.map(el => interpretate(el, env)));

    if (color.length < 3) {
      color = [color[0], 1,1];
    }

    color = hsv2hsl(...color);
    color = [color[0], (color[1]*100).toFixed(2), (color[2]*100).toFixed(2)];

    const colorCss = "hsl("+(3.14*100*color[0]).toFixed(2)+","+color[1]+"%,"+color[2]+"%)";

      //update all mentioned refs
      const refs = Object.values(env.local.refs);
      for (const r of refs) {
        r.execute({method: 'updateColor', color: colorCss})
      }
    }

  g2d.Hue.destroy = (args, env) => {
      delete env.local.refs;
      //delete env.local;
  }    

  g2d.Hue.virtual = true;
  
  //g2d.Hue.destroy = (args, env) => {}

  g2d.CubicInOut = () => 'CubicInOut'
  g2d.Linear = () => 'Linear'

  g2d.Tooltip = () => {
    console.log('Tooltip is not implemented.');
  }

  //g2d.Tooltip.destroy = g2d.Tooltip

  g2dComplex.List = core.List // for speed up searching

  //not an instance. Just a plain object. Symbols must be bounded to GraphicsComplex
  g2dComplex.Polygon = async (args, env) => {
    let points = await interpretate(args[0], env);

    if (!env.vertices) throw('No vertices provided!');

    if (!env.local.line) env.local.line = d3.line()
      .x(function(d) { return env.xAxis(d[0]) })
      .y(function(d) { return env.yAxis(d[1]) });

    const array = [];

    let color = env.color;

    //if this is a single polygon
    if (!points[0][0]) {
      points = [points];
    }

    points.forEach((path) => {
        if (env.vertexColors) {
          //stupid flat shading
          color = [0,0,0];
          path.map((vert) => {
            if(typeof env.vertexColors[vert-1] === 'string') {
              //console.log(env.vertexColors[vert-1]);
              const u = d3.color(env.vertexColors[vert-1]);
              //console.log(u);
              color[0] = color[0] + u.r/255.0;
              color[1] = color[1] + u.g/255.0;
              color[2] = color[2] + u.b/255.0;
            } else {
              color[0] = color[0] + env.vertexColors[vert-1][0];
              color[1] = color[1] + env.vertexColors[vert-1][1];
              color[2] = color[2] + env.vertexColors[vert-1][2];
            }
          });

          color[0] = 255.0 * color[0] / path.length;
          color[1] = 255.0 * color[1] / path.length;
          color[2] = 255.0 * color[2] / path.length;

          color = "rgb("+color[0]+","+color[1]+","+color[2]+")";
      }

      array.push(env.svg.append("path")
          .datum(path.map((vert) => env.vertices[vert-1]))
          .attr("fill", color)
          .attr('fill-opacity', env.opacity)
          .attr('stroke-opacity', env.strokeOpacity || env.opacity)
          .attr("vector-effect", "non-scaling-stroke")
          .attr("stroke-width", env.strokeWidth)
          .attr("stroke", env.stroke || color)
          .attr("d", env.local.line));

    });

    //env.local.area = array;
    return array;
  }

  //this IS an instance
  g2d.Polygon = async (args, env) => {
    let points = await interpretate(args[0], env);
  
    env.local.line = d3.line()
          .x(function(d) { return env.xAxis(d[0]) })
          .y(function(d) { return env.yAxis(d[1]) });

    if (Array.isArray(points[0][0])) {
      console.log('most likely there are many polygons');
      const object = env.svg.append('g')
      .attr("fill", env.color)
      .attr('fill-opacity', env.opacity)
      .attr('stroke-opacity', env.strokeOpacity || env.opacity)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", env.strokeWidth)
      .attr("stroke", env.stroke || env.color);

      points.forEach((e) => {
        e.push(e[0]);
        object.append("path")
          .datum(e)
          .attr("d", env.local.line);
      });

      env.local.polygons = object;
      return object;

    }
    
    points.push(points[0]);
    

  
    env.local.area = env.svg.append("path")
      .datum(points)
      .attr("fill", env.color)
      .attr('fill-opacity', env.opacity)
      .attr('stroke-opacity', env.strokeOpacity || env.opacity)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", env.strokeWidth)
      .attr("stroke", env.stroke || env.color)
      .attr("d", env.local.line);

    if (env.colorRefs) {
        env.colorRefs[env.root.uid] = env.root;
      }
    
    return env.local.area;
  }

  g2d.Polygon.updateColor = (args, env) => {
    if (env.local.polygons) {
      for (const p of env.local.polygons) {
        p.attr("fill", env.color);
      }
      return;
    }

    env.local.object.attr("fill", env.color);
  }

  g2d.Polygon.updateOpacity = (args, env) => {
    if (env.local.polygons) {
      for (const p of env.local.polygons) {
        p.attr("fill-opacity", env.opacity);
        p.attr('stroke-opacity', env.strokeOpacity || env.opacity);
      }
      return;
    }

    env.local.object.attr("fill-opacity", env.opacity);
    env.local.object.attr('stroke-opacity', env.strokeOpacity || env.opacity);
  } 
  
  g2d.Polygon.update = async (args, env) => {
    let points = await interpretate(args[0], env);  

    if (env.local.polygons) {
      throw 'update method for many polygons in not supported'
    }    
  
    const x = env.xAxis;
    const y = env.yAxis;
  
    const object = env.local.area
          .datum(points)
          .maybeTransitionTween(env.transitionType, env.transitionDuration, 'd', function (d) {
            var previous = d3.select(this).attr('d');
            var current = env.local.line(d);
            return interpolatePath(previous, current);
          }); 
    
    return object;  
  }
  
  g2d.Polygon.destroy = (args, env) => {
    console.log('area destroyed');

    if (!env.local) return;
    if (env.colorRefs) {
      delete env.colorRefs[env.root.uid];
    }
    if (env.opacityRefs) {
      delete env.opacityRefs[env.root.uid];
    }
    if (env.local.area) {
      env.local.area.remove();
      delete env.local.area;
      return;
    }

    if (env.local.polygons) {
      env.local.polygons.remove();
      delete env.local.polygons;
    }    
  }
  
  g2d.Polygon.virtual = true; //for local memeory and dynamic binding

  g2d.IdentityFunction = async (args, env) => {
    return (await interpretate(args[0], env));
  }

  g2d.Tooltip = g2d.IdentityFunction

  g2d.StatusArea = g2d.IdentityFunction

  g2d["Charting`DelayedMouseEffect"] = g2d.IdentityFunction

  g2dComplex.Line = async (args, env) => {
    console.log('drawing a line');
    
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    //difference case for verices
    if (!data[0][0]) {

        const object = env.svg.append("path")
        .datum(data.map((index) => env.vertices[index-1]))
        .attr("fill", "none")
        .attr("vector-effect", "non-scaling-stroke")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth)
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          ); 

        return object;
      } else {
        const gr = env.svg.append("g");
        gr.attr("fill", "none")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth);

        data.forEach((dt) => {
          const object = gr.append("path")
          .datum(dt.map((index) => env.vertices[index-1]))
          .attr("vector-effect", "non-scaling-stroke")
          .attr("d", d3.line()
            .x(function(d) { return x(d[0]) })
            .y(function(d) { return y(d[1]) })
            ); 
        });

        return gr;
      }
  }

  g2d.BezierCurve = async (args, env) => {
    let points = await interpretate(args[0], env);
    var path = d3.path(); 

    const x = env.xAxis;
    const y = env.yAxis;

    points = points.map((p) => [x(p[0]), y(p[1])]);

    path.moveTo(...points[0]);
    let indexLeft = points.length - 1;
    for (let i=1; i<points.length - 2; i+=3) {
        indexLeft -= 3;
        path.bezierCurveTo(...points[i], ...points[i+1], ...points[i+2]) 
    }

    if (indexLeft > 0) {
      path.quadraticCurveTo(...points[points.length - 2], ...points[points.length -1]);
    }

    //if (env.returnPath) return path;

    return env.svg.append("path")
        .attr("fill", "none")
        .attr("vector-effect", "non-scaling-stroke")
        .attr('opacity', env.opacity)
        .attr("stroke", env.color)
        .attr("stroke-width", env.strokeWidth)
        .attr("d", path); 
  }

  g2d.Line = async (args, env) => {

    const globalOffset = env.offset;
    
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

    const uid = uuidv4();
    env.local.uid = uid;

    env.local.uid = uid;

    let object;

    //TODO: Get rid of CLASSES!!!!
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
        if (env.returnPath) {
          object = null;
          throw 'Not implemented!';
        } else {
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
        } 
      break;
    
      case 3:
        console.log(data);

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

    env.local.object = object;

    return object;
  }

  //g2d.Line.destroy = (args, env) => {
    //console.warn('Line was destroyed');
  //}




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
        .maybeTransitionTween(env.transitionType, env.transitionDuration, 'd', function (d) {
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
        .attr("class",'line-'+env.local.uid).maybeTransitionTween(env.transitionType, env.transitionDuration, 'd', function (d) {
          var previous = d3.select(this).attr('d');
          var current = env.local.line(d);
          return interpolatePath(previous, current);
        }); 

          /*.attrTween('d', function (d) {
            var previous = d3.select(this).attr('d');
            var current = env.local.line(d);
            return interpolatePath(previous, current);
          }); */

      break;
    
      case 3:
        for (let i=0; i < Math.min(data.length, env.local.nsets); ++i) {
          console.log('upd 1');
          obj = env.svg.selectAll('.line-'+env.local.uid+'-'+i)
          .datum(data[i])
          .attr("class",'line-'+env.local.uid+'-'+i)
          .maybeTransitionTween(env.transitionType, env.transitionDuration, 'd', function (d) {
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
            .maybeTransition(env.transitionType, env.transitionDuration)          
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
            .maybeTransition(env.transitionType, env.transitionDuration)
            .attr("d", env.local.line);            
          }
        }

        
      break;
    }    

    env.local.nsets = Math.max(data.length, env.local.nsets);

    return obj;

  }

  g2d.Line.virtual = true

  g2d.Line.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
    if (!env.local) return;
    if (!env.local.object) return;
    if (Array.isArray(env.local.object)) {
      env.local.object.forEach((o) => o.remove());
    } else {
      env.local.object.remove();
    }
    
    delete env.local.object;
  }

  g2d.Circle = async (args, env) => {

    let data = await interpretate(args[0], env);
    let radius = [1, 1]; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (!Array.isArray(radius)) radius = [radius, radius];
    }

    //console.warn(args);

    const x = env.xAxis;
    const y = env.yAxis;

    env.local.coords = [x(data[0]), y(data[1])];
    env.local.r = [x(radius[0]) - x(0), Math.abs(y(radius[1]) - y(0))];
    //throw env.local.r;
    const object = env.svg
    .append("ellipse")
    .attr("vector-effect", "non-scaling-stroke")
      .attr("cx",  x(data[0]))
      .attr("cy", y(data[1]) )
      .attr("rx", env.local.r[0])
      .attr("ry", env.local.r[1])
      .style("stroke", env.color)
      .style("fill", 'none')
      .style("opacity", env.opacity);

    env.local.object = object;

    if (env.colorRefs) {
      env.colorRefs[env.root.uid] = env.root;
    }
    if (env.opacityRefs) {
      env.opacityRefs[env.root.uid] = env.root;
    }

    return object;
  }

  g2d.Circle.updateColor = (args, env) => {
    env.local.object.style("stroke", env.color);
  }

  g2d.Circle.updateOpacity = (args, env) => {
    env.local.object.style("opacity", env.opacity);
  }  

  g2d.Circle.update = async (args, env) => {
    let data = await interpretate(args[0], env);
    let radius = 1; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (!Array.isArray(radius)) radius = [radius, radius];
    }   

    const x = env.xAxis;
    const y = env.yAxis; 

    //env.local.coords = [x(data[0]), y(data[1])];
    env.local.r = [x(radius[0]) - x(0), Math.abs(y(radius[1]) - y(0))];

   

    env.local.object.maybeTransition(env.transitionType, env.transitionDuration)
    .attr("cx", x(data[0]) )
    .attr("cy", y(data[1]) )
    .attr("rx", env.local.r[0])
    .attr("ry", env.local.r[1])

    return env.local.object;
  }

  g2d.Circle.destroy = (args, env) => {
    env.local.object.remove();
    if (env.colorRefs) {
      delete env.colorRefs[env.root.uid];
    }
    if (env.opacityRefs) {
      delete env.opacityRefs[env.root.uid];
    }
  }

  g2d.Circle.virtual = true

  const deg = function(rad) { return rad * 180 / Math.PI }
  const rad = function (deg) { return deg * Math.PI / 180 }
  const pow = function(n) { return Math.pow(n, 2); }

  function getEllipsePointForAngle(cx, cy, rx, ry, phi, theta) {
    const { abs, sin, cos } = Math;
    
    const M = abs(rx) * cos(theta),
          N = abs(ry) * sin(theta);  
    
    return [
      cx + cos(phi) * M - sin(phi) * N,
      cy + sin(phi) * M + cos(phi) * N
    ];
  }

  function getEndpointParameters(cx, cy, rx, ry, phi, theta, dTheta) {
  
    const [x1, y1] = getEllipsePointForAngle(cx, cy, rx, ry, phi, theta);
    const [x2, y2] = getEllipsePointForAngle(cx, cy, rx, ry, phi, theta + dTheta);
    
    const fa = Math.abs(dTheta) > Math.PI ? 1 : 0;
    const fs = dTheta > 0 ? 1 : 0;
    
    return { x1, y1, x2, y2, fa, fs }
  }  
  
  function getCenterParameters(x1, y1, x2, y2, fa, fs, rx, ry, phi) {
    const { abs, sin, cos, sqrt } = Math;
    const pow = n => Math.pow(n, 2);
  
    const sinphi = sin(phi), cosphi = cos(phi);
  
    // Step 1: simplify through translation/rotation
    const x =  cosphi * (x1 - x2) / 2 + sinphi * (y1 - y2) / 2,
          y = -sinphi * (x1 - x2) / 2 + cosphi * (y1 - y2) / 2;
  
    const px = pow(x), py = pow(y), prx = pow(rx), pry = pow(ry);
    
    // correct of out-of-range radii
    const L = px / prx + py / pry;
  
    if (L > 1) {
      rx = sqrt(L) * abs(rx);
      ry = sqrt(L) * abs(ry);
    } else {
      rx = abs(rx);
      ry = abs(ry);
    }

    // Step 2 + 3: compute center
    const sign = fa === fs ? -1 : 1;
    const M = sqrt((prx * pry - prx * py - pry * px) / (prx * py + pry * px)) * sign;

    const _cx = M * (rx * y) / ry,
          _cy = M * (-ry * x) / rx;

    const cx = cosphi * _cx - sinphi * _cy + (x1 + x2) / 2,
          cy = sinphi * _cx + cosphi * _cy + (y1 + y2) / 2;

    // Step 4: compute θ and dθ
    const theta = vectorAngle(
      [1, 0],
      [(x - _cx) / rx, (y - _cy) / ry]
    );

    let _dTheta = deg(vectorAngle(
        [(x - _cx) / rx, (y - _cy) / ry],
        [(-x - _cx) / rx, (-y - _cy) / ry]
    )) % 360;

    if (fs === 0 && _dTheta > 0) _dTheta -= 360;
    if (fs === 1 && _dTheta < 0) _dTheta += 360;
  
    return { cx, cy, theta, dTheta: rad(_dTheta) };
}

function vectorAngle ([ux, uy], [vx, vy]) {
  const { acos, sqrt } = Math;
  const sign = ux * vy - uy * vx < 0 ? -1 : 1,
        ua = sqrt(ux * ux + uy * uy),
        va = sqrt(vx * vx + vy * vy),
        dot = ux * vx + uy * vy;

  return sign * acos(dot / (ua * va));
};




  g2d._arc = async (args, env) => {
    let data = await interpretate(args[0], env);
    let radius = await interpretate(args[1], env);
      if (!Array.isArray(radius)) radius = [radius, radius];
    
    let angles = (await interpretate(args[2], env)).map((a) => 2*Math.PI - a);

    const x = env.xAxis;
    const y = env.yAxis;

    //env.local.coords = [x(data[0]), y(data[1])];
    //env.local.r = [x(radius[0]) - x(0), Math.abs(y(radius[1]) - y(0))];
    const ellipse = {
      cx: x(data[0]),
      cy: y(data[1]),

      phi: 0,
      rx: x(radius[0]) - x(0),
      ry: Math.abs(y(radius[1]) - y(0)),
      start: angles[0],
      delta: angles[1]-angles[0]
    };

    console.error(angles);


    const { x1, y1, x2, y2, fa, fs } = getEndpointParameters(
      ellipse.cx,
      ellipse.cy,
      ellipse.rx,
      ellipse.ry,
      ellipse.phi,
      ellipse.start,
      ellipse.delta
    );

    const { cx, cy, theta, dTheta } = getCenterParameters(
      x1,
      y1,
      x2,
      y2,
      fa,
      fs,
      ellipse.rx,
      ellipse.ry,
      ellipse.phi
    );  

   // console.log({x: x(data[0]), xorg: data[0], r: env.local.r, rorg: radius});

    const object = env.svg.append("path") 
      .attr("vector-effect", "non-scaling-stroke")
      .style("fill", env.color)
      .style("opacity", env.opacity) 
      .attr("d",
        `M ${cx} ${cy}
         L ${x1} ${y1}
         A ${ellipse.rx} ${ellipse.ry} ${deg(ellipse.phi)} ${fa} ${fs} ${x2} ${y2}
         Z`) 
      
    return object;
  }

  g2dComplex.Disk = async (args, env) => {
    if (args.length > 2) {
      throw('Graphics complex with arcs is not supported');
    }

    let data = await interpretate(args[0], env);
    let radius = 1; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (Array.isArray(radius)) radius = (radius[0] + radius[1])/2.0;
    }

    //console.warn(args);

    const x = env.xAxis;
    const y = env.yAxis;

    if (!data[0]) {
      //single vertice
      const vertex = env.vertices[data-1];
      const coords = [x(vertex[0]), y(vertex[1])];
      const r = x(radius) - x(0);

      const object = env.svg
      .append("circle")
      .attr("vector-effect", "non-scaling-stroke")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", r)
        .style("stroke", 'none')
        .style("fill", env.color)
        .style("opacity", env.opacity);

  
      return object;

    } else {
      const object = [];
      const r = x(radius) - x(0);

      data.map((index) => env.vertices[index-1]).map((disk) => {
        object.push(env.svg
        .append("circle")
        .attr("vector-effect", "non-scaling-stroke")
          .attr("cx", x(disk[0]))
          .attr("cy", y(disk[1]))
          .attr("r", r)
          .style("stroke", 'none')
          .style("fill", env.color)
          .style("opacity", env.opacity));
      });

      return object;
    }

  }


  g2d.Disk = async (args, env) => {
    if (args.length > 2) {
      return await g2d._arc(args, env);
    }

    let data = await interpretate(args[0], env);
    let radius = [1, 1]; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (!Array.isArray(radius)) radius = [radius, radius];
    }

    //console.warn(args);

    const x = env.xAxis;
    const y = env.yAxis;

    env.local.coords = [x(data[0]), y(data[1])];
    env.local.r = [x(radius[0]) - x(0), Math.abs(y(radius[1]) - y(0))];
    //throw env.local.r;
    const object = env.svg
    .append("ellipse")
    .attr("vector-effect", "non-scaling-stroke")
      .attr("cx",  x(data[0]))
      .attr("cy", y(data[1]) )
      .attr("rx", env.local.r[0])
      .attr("ry", env.local.r[1])
      .style("stroke", 'none')
      .style("fill", env.color)
      .style("opacity", env.opacity);

    env.local.object = object;

    if (env.colorRefs) {
      env.colorRefs[env.root.uid] = env.root;
    }
    if (env.opacityRefs) {
      env.opacityRefs[env.root.uid] = env.root;
    }

    return object;
  }

  g2d.Disk.update = async (args, env) => {
    let data = await interpretate(args[0], env);
    let radius = env.local.r; 

    if (args.length > 1) {
      radius = await interpretate(args[1], env);
      if (!Array.isArray(radius)) radius = [radius, radius];
    }

    const x = env.xAxis;
    const y = env.yAxis;     

    env.local.coords = [x(data[0]), y(data[1])];
    env.local.r = [x(radius[0]) - x(0), Math.abs(y(radius[1]) - y(0))];

    //console.warn(args);

 
    
    env.local.object.maybeTransition(env.transitionType, env.transitionDuration)
    .attr("cx",  env.local.coords[0])
    .attr("cy", env.local.coords[1])
    .attr("rx", env.local.r[0])
    .attr("ry", env.local.r[1]);
  }

  g2d.Disk.updateColor = (args, env) => {
    env.local.object.style("fill", env.color);
  }

  g2d.Disk.updateOpacity = (args, env) => {
    env.local.object.style("opacity", env.opacity);
  }  


  //g2d.Disk.destroy = () => {}

  g2d.Disk.virtual = true

  g2d.Disk.destroy = (args, env) => {
    console.log('nothing to destroy');
    if (!env.local) return;
    if (!env.local.object) return;
    if (env.colorRefs) {
      delete env.colorRefs[env.root.uid];
    }
    if (env.opacityRefs) {
      delete env.opacityRefs[env.root.uid];
    }
    env.local.object.remove();
    
    delete env.local.object;
    //delete env.local.area;
  }
  
  g2dComplex.Point = async (args, env) => {
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;    

    if (data[0][0]) data = data.flat();
    data = data.map((e) => env.vertices[e-1]);

    const object = env.svg.append('g')
    .style("stroke-width", env.pointSize*100*2)
    .style("stroke-linecap", "round")
    .style("stroke", env.color)
    .style("opacity", env.opacity);

    const points = [];

    //a hack to make non-scalable 
    //https://muffinman.io/blog/svg-non-scaling-circle-and-rectangle/
    let color;

    data.forEach((d, vert) => {

      if (env.vertexColors) {
       
        color = [0,0,0];
        if(typeof env.vertexColors[vert] === 'string') {
          //console.log(env.vertexColors[vert-1]);
          const u = d3.color(env.vertexColors[vert]);
          //console.log(u);
          color[0] = color[0] + u.r/255.0;
          color[1] = color[1] + u.g/255.0;
          color[2] = color[2] + u.b/255.0;
        } else {
          color[0] = color[0] + env.vertexColors[vert][0];
          color[1] = color[1] + env.vertexColors[vert][1];
          color[2] = color[2] + env.vertexColors[vert][2];
        }

        color[0] = 255.0 * color[0] ;
        color[1] = 255.0 * color[1] ;
        color[2] = 255.0 * color[2] ;

        color = "rgb("+color[0]+","+color[1]+","+color[2]+")";
        points.push(
          object.append("path")
         .attr('stroke', color)
         .attr("d", `M ${x(d[0])} ${y(d[1])} l 0.0001 0`) 
         .attr("vector-effect", "non-scaling-stroke")
         );

      } else {
        points.push(
         object.append("path")
        .attr("d", `M ${x(d[0])} ${y(d[1])} l 0.0001 0`) 
        .attr("vector-effect", "non-scaling-stroke")
        );
      }
    });


    return object;

  }

  g2d.Point = async (args, env) => {
    let data = await interpretate(args[0], env);
    const x = env.xAxis;
    const y = env.yAxis;

      const dp = arrDepth(data);
      if (dp === 0) {
          data = [];
      } else {
        if (dp < 2) {
          data = [data];
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

    if (env.colorRefs) {
      env.colorRefs[env.root.uid] = env.root;
    }
    if (env.opacityRefs) {
      env.opacityRefs[env.root.uid] = env.root;
    }

    const points = [];

    //a hack to make non-scalable 
    //https://muffinman.io/blog/svg-non-scaling-circle-and-rectangle/
    let color;

    data.forEach((d, vert) => {

      
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

  g2d.Point.updateColor = (args, env) => {
    env.local.object.style("stroke", env.color);
  }

  g2d.Point.updateOpacity = (args, env) => {
    env.local.object.style("opacity", env.opacity);
  }    

  g2d.Point.update = async (args, env) => {
    let data = await interpretate(args[0], env);
    

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

      object = object.maybeTransition(env.transitionType, env.transitionDuration)
      .attr("d", `M ${x(data[i][0])} ${y(data[i][1])} l 0.0001 0`) 
      .style("opacity", env.opacity);
    };

    for (let i=env.local.points.length; i>data.length; i--) {
      object = env.local.points.pop();

      object.maybeTransition(env.transitionType, env.transitionDuration)
      .style("opacity", 0)
      .remove(); 
    };

    for (let i=0; i < minLength; i++) {
      object = env.local.points[i].maybeTransition(env.transitionType, env.transitionDuration)
      .attr("d", `M ${x(data[i][0])} ${y(data[i][1])} l 0.0001 0`);
    }

    return object;
  }

  //g2d.Point.destroy = (args, env) => {interpretate(args[0], env)}

  g2d.Point.virtual = true  

  g2d.Point.destroy = (args, env) => {
    console.log('nothing to destroy');
    if (!env.local) return;
    if (!env.local.object) return;

    if (env.colorRefs) 
      delete env.colorRefs[env.root.uid];

    if (Array.isArray(env.local.object)) {
      env.local.object.forEach((o) => o.remove());
    } else {
      env.local.object.remove();
    }
    
    delete env.local.object;
  }

  g2d.EventListener = async (args, env) => {
    const rules = await interpretate(args[1], env);
    const copy = {...env};

    let object = await interpretate(args[0], copy);
    if (Array.isArray(object)) object = object[0];

    if (!object.on_list) object.on_list = {};

    rules.forEach((rule)=>{
      g2d.EventListener[rule.lhs](rule.rhs, object, copy);
    });

    return null;
  }

  g2d.EventListener.update = async (args, env) => {
    console.log('EventListener does not support updates');
  }
  
  g2d.EventListener.onload = (uid, object, env) => {

    console.log('onload event generator');
    server.kernel.emitt(uid, `True`, 'onload');
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

  //g2d.MiddlewareListener.destroy = (args, env) => {
    //return interpretate(args[0], env);
  //}  

  g2d.MiddlewareListener.end = (uid, params, env) => {
    const threshold = params.Threshold || 1.0;
    
    server.kernel.emitt(uid, `True`, 'end');
    console.log("pre Fire");

    return (object) => {
      let state = false;
      

      return object.then((r) => r.tween(uid, function (d) {
        return function (t) {
          if (t >= threshold && !state) {
            server.kernel.emitt(uid, `True`, 'end');
            state = true;
          }
        }
      }))
    }
  }

  g2d.MiddlewareListener.endtransition = g2d.MiddlewareListener.end

  //g2d.EventListener.destroy = (args, env) => {interpretate(args[0], env)}

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
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'drag')
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
      server.kernel.emitt(uid, `{"${t}", {${x}, ${y}}}`.replace('e', '*^').replace('e', '*^'), 'dragall')
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
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'click')
    });
  
    function clicked(event, p) {
      if (!event.altKey)
        updatePos(xAxis.invert(p[0]), yAxis.invert(p[1]))
    }
  
    if ('click' in object.on_list) {
      object.on_list.click.push((e)=>clicked(e, d3.pointer(e)));
    } else {
      object.on_list.click = [
        (e)=>clicked(e, d3.pointer(e))
      ];
      object.on("click", (e)=>{
        for (let i=0; i<object.on_list.click.length; ++i) object.on_list.click[i](e)
      });
    }
  };  

  g2d.EventListener.mousedown = (uid, object, env) => {

    console.log('mousedown event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'mousedown')
    });
  
    function clicked(event, p) {
      //if (event.altKey)
        updatePos(xAxis.invert(p[0]), yAxis.invert(p[1]))
    }
  
    object.on("mousedown", (e)=>clicked(e, d3.pointer(e)));
  };  

  g2d.EventListener.mouseup = (uid, object, env) => {

    console.log('mouseup event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'mouseup')
    });
  
    function clicked(event, p) {
      //if (event.altKey)
        updatePos(xAxis.invert(p[0]), yAxis.invert(p[1]))
    }
  
    object.on("mouseup", (e)=>clicked(e, d3.pointer(e)));
  };  

  g2d.EventListener.altclick = (uid, object, env) => {

    console.log('click event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'altclick')
    });
  
    function clicked(event, p) {
      if (event.altKey)
        updatePos(xAxis.invert(p[0]), yAxis.invert(p[1]))
    }
  
    if ('click' in object.on_list) {
      object.on_list.click.push((e)=>clicked(e, d3.pointer(e)));
    } else {
      object.on_list.click = [
        (e)=>clicked(e, d3.pointer(e))
      ];
      object.on("click", (e)=>{
        for (let i=0; i<object.on_list.click.length; ++i) object.on_list.click[i](e)
      });
    }
  };  

  g2d.EventListener.capturekeydown = (uid, object, env) => {
    //console.error('You cannot listen keys from the SVG element!');
    let focus;
    let enabled = true;
    const el = object;
    //force focus
    focus = () => {
      if (!enabled) return;
      el.node().focus();
      enabled = false;
    }

    const addClickListener = (func) => {
      if ('click' in object.on_list) {
        object.on_list.click.push(func);
      } else {
        object.on_list.click = [
          func
        ];
        object.on("click", (e)=>{
          for (let i=0; i<object.on_list.click.length; ++i) object.on_list.click[i](e)
        });
      }
    }

    addClickListener(focus);

    el.on('blur', ()=>{
      enabled = true;
    });

    //console.error(el.on);

    el.node().addEventListener('keydown', (e) => {
      //console.log(e);
      server.kernel.emitt(uid, '"'+e.code+'"', 'capturekeydown');
      e.preventDefault();
    });
  };  

  g2d.EventListener.keydown = (uid, object, env) => {
    //console.error('You cannot listen keys from the SVG element!');
    let focus;
    let enabled = true;
    const el = object;
    //force focus
    focus = () => {
      if (!enabled) return;
      el.node().focus();
      enabled = false;
    }

    const addClickListener = (func) => {
      if ('click' in object.on_list) {
        object.on_list.click.push(func);
      } else {
        object.on_list.click = [
          func
        ];
        object.on("click", (e)=>{
          for (let i=0; i<object.on_list.click.length; ++i) object.on_list.click[i](e)
        });
      }
    }

    addClickListener(focus);

    el.on('blur', ()=>{
      enabled = true;
    });

    el.addEventListener('keydown', (e) => {
      //console.log(e);
      server.kernel.emitt(uid, '"'+e.code+'"', 'keydown');
      //e.preventDefault();
    });
  };  

  g2d.EventListener.mousemove = (uid, object, env) => {

    console.log('mouse event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'mousemove');
    });
  
    function moved(arr) {
      updatePos(xAxis.invert(arr[0]), yAxis.invert(arr[1]))
    }
  
    object.on("mousemove", (e) => moved(d3.pointer(e)));
  };   

  g2d.EventListener.mouseover = (uid, object, env) => {

    console.log('mouse event generator');
    console.log(env.local);
    const xAxis = env.xAxis;
    const yAxis = env.yAxis;

    const updatePos = throttle((x,y) => {
      server.kernel.emitt(uid, `{${x}, ${y}}`.replace('e', '*^').replace('e', '*^'), 'mouseover')
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
      server.kernel.emitt(uid, `${k}`, 'zoom');
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
    let aligment;
    if (args.length > 2) {
      aligment = await interpretate(args[2], env);
      env.local.aligment = aligment;
    }

    const group = env.svg.append("g");
    
    env.local.group = group;

    await interpretate(args[0], {...env, svg: group});

    let centre = group.node().getBBox();
    
    if (aligment) {
      centre.x = (env.xAxis(aligment[0]));
      centre.y = (env.yAxis(aligment[1]));
    } else {
      centre.x = (centre.x + centre.width / 2);
      centre.y = (centre.y + centre.height / 2);
    }


    const rotation = "rotate(" + (degrees / Math.PI * 180.0) + ", " + 
    centre.x + ", " + centre.y + ")";

    group.attr("transform", rotation);

    env.local.rotation = rotation;
  }

  g2d.Rotate.update = async (args, env) => {
    const degrees = await interpretate(args[1], env);

    let centre;
    centre = env.local.group.node().getBBox();
    
    if (env.local.aligment) {
      centre.x = (env.xAxis(env.local.aligment[0]));
      centre.y = (env.yAxis(env.local.aligment[1]));
      //console.log({x: env.xAxis(env.local.aligment[0]) - env.xAxis(0), y:env.yAxis(env.local.aligment[1]) - env.yAxis(0),

        //x0: centre.width / 2, y0: centre.height / 2
      //});
    } else {
      centre.x = (centre.x + centre.width / 2);
      centre.y = (centre.y + centre.height / 2);
    }
       
    const rotation = "rotate(" + (degrees / Math.PI * 180.0) + ", " + (centre.x ) + ", " + (centre.y ) + ")";

    var interpol_rotate = d3.interpolateString(env.local.rotation, rotation);

    env.local.group.maybeTransitionTween(env.transitionType, env.transitionDuration, 'transform' , function(d,i,a){ return interpol_rotate } )
  
    env.local.rotation = rotation;
  }

  g2d.Rotate.virtual = true

  g2d.Rotate.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  }

  g2d.Translate = async (args, env) => {
    const pos = await interpretate(args[1], env);
    const group = env.svg.append("g");

   // if (arrDepth(pos) > 1) throw 'List arguments for Translate is not supported for now!';
    
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

    return env.local.group.maybeTransition(env.transitionType, env.transitionDuration).attr("transform", `translate(${xAxis(pos[0])- xAxis(0)}, ${yAxis(pos[1]) - yAxis(0)})`);
  }

  //g2d.Translate.destroy = async (args, env) => {
   // const pos = await interpretate(args[1], env);
   // const obj = await interpretate(args[0], env);
  //}  

  g2d.Translate.virtual = true  

  g2d.Translate.destroy = (args, env) => {
    console.log('nothing to destroy');
    //delete env.local.area;
  }


  g2d.Center = () => 'Center'
  //g2d.Center.destroy = g2d.Center
  g2d.Center.update = g2d.Center

  g2d.Degree = () => Math.PI/180.0;
  //g2d.Degree.destroy = g2d.Degree
  g2d.Degree.update = g2d.Degree


  g2d.Rectangle = async (args, env) => {
    const from = await interpretate(args[0], env);
    const to = await interpretate(args[1], env);

    if (from[1] > to[1]) {
      const t = from[1];
      from[1] = to[1];
      to[1] = t;
    }

    if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }

    const x = env.xAxis;
    const y = env.yAxis;

    from[0] = x(from[0]);
    from[1] = y(from[1]);
    to[0] = x(to[0]);
    to[1] = y(to[1]);

    /*if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }*/


    

    const size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];



    env.local.rect = env.svg.append('rect')
    .attr('x', from[0])
    .attr('y', from[1] - size[1])
    .attr('width', size[0])
    .attr('height', size[1])
    .attr("vector-effect", "non-scaling-stroke")
    .attr('stroke', env.stroke)
    .attr('opacity', env.opacity)
    .attr('fill', env.color);

    if (env.colorRefs) {
      env.colorRefs[env.root.uid] = env.root;
    }
    if (env.opacityRefs) {
      env.opacityRefs[env.root.uid] = env.root;
    }

    return env.local.rect;
     
  }

  g2d.Rectangle.updateColor = (args, env) => {
    env.local.rect.attr('fill', env.color);
  }

  g2d.Rectangle.updateOpacity = (args, env) => {
    env.local.rect.attr('opacity', env.opacity);
  }  

  //g2d.Rectangle.destroy = async (args, env) => {
    //await interpretate(args[0], env);
    //await interpretate(args[1], env);
  //}
  
  g2d.Rectangle.update = async (args, env) => {
    const from = await interpretate(args[0], env);
    const to = await interpretate(args[1], env);
    
    if (from[1] > to[1]) {
      const t = from[1];
      from[1] = to[1];
      to[1] = t;
    }

    if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }

    const x = env.xAxis;
    const y = env.yAxis;

    from[0] = x(from[0]);
    from[1] = y(from[1]);
    to[0] = x(to[0]);
    to[1] = y(to[1]);

    /*if (from[0] > to[0]) {
      const t = from[0];
      from[0] = to[0];
      to[0] = t;
    }

    if (from[1] > to[1]) {
      const t = from[1];
      from[1] = to[1];
      to[1] = t;
    }*/

    

    const size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];



    env.local.rect.maybeTransition(env.transitionType, env.transitionDuration)
    .attr('x', from[0])
    .attr('y', from[1] - size[1]) 
    .attr('width', size[0])
    .attr('height', size[1]);


  }

  g2d.Rectangle.virtual = true

  g2d.Rectangle.destroy = (args, env) => {
    console.log('nothing to destroy');
    if (!env.local) return;
    if (!env.local.rect) return;
    if (env.colorRefs) {
      delete env.colorRefs[env.root.uid];
    }
    if (env.opacityRefs) {
      delete env.opacityRefs[env.root.uid];
    }
    env.local.rect.remove();

    delete env.local.rect;
    //delete env.local.area;
  }

  //plugs
  g2d.Void = (args, env) => {};

  g2d.Identity              = g2d.Void;
  g2d.Scaled                = g2d.Void;
  g2d.GoldenRatio           = g2d.Void;
  g2d.None                  = () => false;

  g2d.AbsolutePointSize     = g2d.Void;
  g2d.CopiedValueFunction   = g2d.Void;

  g2d.Raster = async (args, env) => {
    if (env.image) return await interpretate(args[0], env);
    //TODO THIS SUCKS

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
          .attr('fill', `rgb(${Math.floor(255*data[i][j])}, ${Math.floor(255*data[i][j])}, ${Math.floor(255*data[i][j])})`);
          
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
          .attr('fill', `rgb(${Math.floor(255*data[i][j][0])}, ${Math.floor(255*data[i][j][0])}, ${Math.floor(255*data[i][j][0])})`);
          
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
          .attr('fill', `rgb(${Math.floor(255*data[i][j][0])}, ${Math.floor(255*data[i][j][1])}, ${Math.floor(255*data[i][j][2])})`);
          
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
          .attr('fill', `rgb(${Math.floor(255*data[i][j][0])}, ${Math.floor(255*data[i][j][1])}, ${Math.floor(255*data[i][j][2])})`);
          
        }
      } 
      return;
    }    
  }

  //g2d.Raster.destroy = () => {}
  g2d.Magnification = () => "Magnification"
  g2d.ColorSpace = () => "ColorSpace"
  g2d.Interleaving = () => "Interleaving"
  g2d.MetaInformation = () => "MetaInformation"
  g2d.ImageResolution = () => "ImageResolution"

  g2d.DateObject = () => {
    console.warn('Date Object is not supported for now');
  }

  const numericAccelerator = {};
  numericAccelerator.TypeReal    = {}
  numericAccelerator.TypeInteger = {}

  const types = {
    Real64: {
      context: numericAccelerator.TypeReal,
      constructor: Float64Array
    },
    Real32: {
      context: numericAccelerator.TypeReal,
      constructor: Float32Array
    },
    Integer32: {
      context: numericAccelerator.TypeInteger,
      constructor: Int32Array
    },
    Integer64: {
      context: numericAccelerator.TypeInteger,
      constructor: BigInt64Array
    },
    Integer16: {
      context: numericAccelerator.TypeInteger,
      constructor: Int16Array
    },   
    Integer8: {
      context: numericAccelerator.TypeInteger,
      constructor: Int8Array
    },  
    UnsignedInteger32: {
      context: numericAccelerator.TypeInteger,
      constructor: Uint32Array
    },
    UnsignedInteger64: {
      context: numericAccelerator.TypeInteger,
      constructor: BigUint64Array      
    },
    UnsignedInteger16: {
      context: numericAccelerator.TypeInteger,
      constructor: Uint16Array      
    },   
    UnsignedInteger8: {
      context: numericAccelerator.TypeInteger,
      constructor: Uint8Array      
    }
  }

  function checkDepth(array, size = []) {
    if (Array.isArray(array)) {
      size.push(array.length);
      return checkDepth(array[0], size);
    }
    return size;
  }

  const WLNumber = new RegExp(/^(-?\d+)(.?\d*)(\*\^)?(\d*)/);
  const isInteger = window.isNumeric;

  function readArray(arr, env) {
    if (Array.isArray(arr[1])) {
      for (let i=1; i<arr.length; ++i) {
        readArray(arr[i], env)
      }

      return;
    }

    env.array.set(arr.slice(1).map((el) => {
      if (typeof el == 'string') {
        if (isInteger(el)) return parseInt(el); //for Integers
  
        if (WLNumber.test(el)) {
          //deconstruct the string
          let [begin, floatString, digits, man, power] = el.split(WLNumber);
        
          if (digits === '.')
            floatString += digits + '0';
          else
            floatString += digits;
        
          if (man)
            floatString += 'E' + power;
  
        
          return parseFloat(floatString);
        }
      }

      return el;
    }), env.index);
    env.index += arr.length - 1;
  }

  numericAccelerator.NumericArray = (args, env) => {
    //console.log(args);
    const type = types[interpretate(args[1])];
    //console.log('ACCELERATOR!');
    
    
    const depth = [];
    let size = (args[0].length - 1);
    depth.push(size);

    if (args[0][1][0] === 'List') {
      size = size * (args[0][1].length - 1);
      depth.push((args[0][1].length - 1));

      if (args[0][1][1][0] === 'List') {
        size = size * (args[0][1][1].length - 1);
        depth.push((args[0][1][1].length - 1));
      }
    }

    //const time = performance.now();
    //const benchmark = [];
    
    const array = new type.constructor(size);
    //benchmark.push(performance.now() - time);
    readArray(args[0], {index: 0, array: array});
    //benchmark.push(performance.now() - time);
    
    //benchmark.push(performance.now() - time);
    //console.warn(benchmark);
    return {buffer: array, depth: depth};
  }

  numericAccelerator.NumericArray.update = numericAccelerator.NumericArray;

  //numericAccelerator.List = (args, env) => args



  function moveRGBAReal(src, dest, size) {
    var i, j = 0;
    for (i = 0; i < size << 2; ) {
        dest[i++] = ((src[j++] * 255) >>> 0);
        dest[i++] = ((src[j++] * 255) >>> 0);
        dest[i++] = ((src[j++] * 255) >>> 0);
        dest[i++] = ((src[j++] * 255) >>> 0);
    }    
  }

  function moveRGBReal(src, dest, size) {
    var i, j = 0;
    const destW = new Uint32Array(dest.buffer);
    const alpha = 0xFF000000;  // alpha is the high byte. Bits 24-31
    for (i = 0; i < size; i++) {
        destW[i] = alpha + ((src[j++] * 255) >>> 0) + (((src[j++] * 255) >>> 0) << 8) + (((src[j++] * 255) >>> 0) << 16);
    }    
  }  

  function moveGrayReal(src, dest, size) {
    var i;
    const destW = new Uint32Array(dest.buffer);
    const alpha = 0xFF000000;  // alpha is the high byte. Bits 24-31
    for (i = 0; i < size; i++) {
        const g = (src[i]*255) >>> 0;
        destW[i] = alpha + (g << 16) + (g << 8) + g;
    }    
  }

  function moveRGB(src, dest, size) {
    var i, j = 0;
    const destW = new Uint32Array(dest.buffer);
    const alpha = 0xFF000000;  // alpha is the high byte. Bits 24-31
    for (i = 0; i < size; i++) {
        destW[i] = alpha + src[j++] + (src[j++] << 8) + (src[j++] << 16);
    }    
  }

  function moveGray(src, dest, size) {
    var i;
    const destW = new Uint32Array(dest.buffer);
    const alpha = 0xFF000000;  // alpha is the high byte. Bits 24-31
    for (i = 0; i < size; i++) {
        const g = src[i];
        destW[i] = alpha + (g << 16) + (g << 8) + g;
    }    
  }  

  function moveGrayBits(src, dest, size) {
    var i;
    const destW = new Uint32Array(dest.buffer);
    const alpha = 0xFF000000;  // alpha is the high byte. Bits 24-31
    for (i = 0; i < size; i++) {
        const g = src[i] << 8;
        destW[i] = alpha + (g << 16) + (g << 8) + g;
    }    
  }   

  const imageTypes = {
    Byte: {
      constructor: Uint8Array,
      convert: (array) => {
        if (array.depth.length === 3) {
          if (array.depth[2] === 4) {
            //console.error(array);
            const rgba = new Uint8ClampedArray(array.buffer);
            //moveRGB(array.buffer, rgba, size);
            return rgba;
            //return array.buffer;
          }
          if (array.depth[2] === 3) {
            const size = array.depth[0] * array.depth[1];
            const rgba = new Uint8ClampedArray(size << 2);
            moveRGB(array.buffer, rgba, size);
            return rgba;
          }

          throw 'It must be RGB or RGBA!';
        }

        if (array.depth.length === 2) {
          const size = array.depth[0] * array.depth[1];
          const rgba = new Uint8ClampedArray(size << 2);
          moveGray(array.buffer, rgba, size);
          return rgba;          
        }

        throw 'This is not an image data!';
      }
    },

    Bit: {
      constructor: Uint8Array,
      convert: (array) => {
        const size = array.depth[0] * array.depth[1];
        const rgba = new Uint8ClampedArray(size << 2);
        moveGrayBits(array.buffer, rgba, size);
        return rgba;  
      }
    },

    Real32: {
      constructor: Float32Array,
      convert: (array) => {
        if (array.depth.length === 3) {
          if (array.depth[2] === 4) {
            const size = array.depth[0] * array.depth[1];
            const rgba = new Uint8ClampedArray(size << 2);
            moveRGBAReal(array.buffer, rgba, size);
            return rgba;
          }

          if (array.depth[2] === 3) {
            const size = array.depth[0] * array.depth[1];
            const rgba = new Uint8ClampedArray(size << 2);
            moveRGBReal(array.buffer, rgba, size);
            return rgba;
          }

          throw 'It must be RGB or RGBA!';
        }

        if (array.depth.length === 2) {
          const size = array.depth[0] * array.depth[1];
          const rgba = new Uint8ClampedArray(size << 2);
          moveGrayReal(array.buffer, rgba, size);
          return rgba;          
        }

        throw 'This is not an image data!';
      }
    },

    Real64: {
      contructor: Float64Array,
      convert: (array) => {
        if (array.depth.length === 3) {
          if (array.depth[2] === 4) {
            const size = array.depth[0] * array.depth[1];
            const rgba = new Uint8ClampedArray(size << 2);
            moveRGBAReal(array.buffer, rgba, size);
            return rgba;
          }
          if (array.depth[2] === 3) {
            const size = array.depth[0] * array.depth[1];
            const rgba = new Uint8ClampedArray(size << 2);
            moveRGBReal(array.buffer, rgba, size);
            return rgba;
          }

          throw 'It must be RGB or RGBA!';
        }

        if (array.depth.length === 2) {
          const size = array.depth[0] * array.depth[1];
          const rgba = new Uint8ClampedArray(size << 2);
          moveGrayReal(array.buffer, rgba, size);
          return rgba;          
        }

        throw 'This is not an image data!';
      }
    }
  }

  g2d.Antialiasing = () => 'Antialiasing'

  g2d.Image = async (args, env) => {
    const options = await core._getRules(args, {...env, context: g2d});

    const time = performance.now();
    const benchmark = [];
    console.log(args);

    let data = await interpretate(args[0], {...env, context: [numericAccelerator, g2d]});

    benchmark.push(`${performance.now() - time} passed`);

    let type = 'Real32';

    if (args.length - Object.keys(options).length > 1) {
      type = interpretate(args[1]);
    }

    type = imageTypes[type];

    let imageData;

    //if not typed array
    if (Array.isArray(data)) {
      data = {buffer: data.flat(Infinity), depth: checkDepth(data)};
    }

    imageData = type.convert(data);
    benchmark.push(`${performance.now() - time} passed`);

   
    env.local.type = type;

    console.warn('ImageSize');
    console.warn(data.depth);
    const height = data.depth[0];
    const width  = data.depth[1];

    env.local.dims = data.depth;

    console.log({imageData, width, height});

    imageData = new ImageData(new Uint8ClampedArray(imageData), width, height);
    benchmark.push(`${performance.now() - time} passed`);

    let ImageSize = options.ImageSize;
    if (options.Magnification) {
      //options.Magnification = await interpretate(options.Magnification, env);
      ImageSize = Math.floor(width * options.Magnification);
    }

    if (!ImageSize) {
      if (env.imageSize) {
        ImageSize = env.imageSize;
      } else {
        ImageSize = width;
      }
    }

    //only width can be controlled!
    if (Array.isArray(ImageSize)) ImageSize = ImageSize[0];

    const target_width = Math.floor(ImageSize);
    const target_height = Math.floor((height / width) * (ImageSize));    

    console.warn('ImageSize');
    console.warn({target_width, target_height});

    env.local.targetDims = [target_height, target_width];


    let ctx;
    const dpi = window.devicePixelRatio;

    if (env.inset) {
      const foreignObject = env.inset.append('foreignObject')
      .attr('width', target_width / dpi)
      .attr('height', target_width / dpi);
    
      const canvas = foreignObject.append('xhtml:canvas')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml').node();

      canvas.style.width = target_width / dpi + 'px';
      canvas.style.height = target_height / dpi + 'px';

      ctx = canvas.getContext('2d');
    } else {
      var canvas = document.createElement("canvas");
      canvas.width = target_width;
      canvas.height = target_height;      
      env.element.appendChild(canvas);
      canvas.style.width = target_width / dpi + 'px';
      canvas.style.height = target_height / dpi + 'px';
      ctx  = canvas.getContext("2d");
    }

    env.local.ctx = ctx;

    if('Antialiasing' in options) {
      ctx.imageSmoothingEnabled = options.Antialiasing
    }
    
    //canvas.getContext('2d').scale(dpi, dpi);

    benchmark.push(`${performance.now() - time} passed`);

    if (target_width != width || target_height != height) {
      env.local.resized = true;
      console.warn('Resizing might be slow');
      imageData = await createImageBitmap(imageData);
      ctx.drawImage(imageData, 0,0, target_width, target_height);
    } else {
      ctx.putImageData(imageData,0,0);
    }

    
    
    benchmark.push(`${performance.now() - time} passed`);

    console.warn(benchmark);
}

g2d.Image.update = async (args, env) => {
  let data = await interpretate(args[0], {...env, context: [numericAccelerator, g2d]});
    //if not typed array
    if (Array.isArray(data)) {
      console.warn('Image:update: not a typed array. It will be slow...');
      data = {buffer: data.flat(Infinity), depth: checkDepth(data)};
    }    

    let imageData = env.local.type.convert(data);
    imageData = new ImageData(new Uint8ClampedArray(imageData), env.local.dims[1], env.local.dims[0]);
    
    if (env.local.resized) {
      imageData = await createImageBitmap(imageData);
      env.local.ctx.clearRect(0, 0, env.local.targetDims[1], env.local.targetDims[0]);
      env.local.ctx.drawImage(imageData, 0,0, env.local.targetDims[1], env.local.targetDims[0]);
    } else {
      env.local.ctx.putImageData(imageData,0,0);
    }
  
  
}

g2d.Image.destroy = (args, env) => {
  
}







g2d.GraphicsGroupBox = g2d.GraphicsGroup
g2d.GraphicsComplexBox = g2d.GraphicsComplex
g2d.DiskBox = g2d.Disk
g2d.LineBox = g2d.Line
