
// var partiesICO = {
// 	'DEM':'http://www.dem.org.br/favicon.ico',
// 	'PCdoB':'http://www.pcdob.org.br/img/logo.bottom.png',
// 	'PDT':'http://www.pdt.org.br/favicon.ico',

// }

if(!d3.chart) d3.chart = {};

d3.chart.deputiesScatterplot = function() {
	var g,
	    data,
	    dispatch = d3.dispatch("update",'cuttingPlane');

	var _dimensions ={},
		_scale = {},
		margin;

	function chart(containerSVG, dimensions) {
		
		_dimensions = dimensions;
		margin = {top: _dimensions.radius+5, right: _dimensions.radius+5, bottom: _dimensions.radius+5, left: _dimensions.radius+5};
		_dimensions.width = _dimensions.width - margin.left - margin.right;
	  	_dimensions.height = _dimensions.height - margin.top - margin.bottom;


		g = containerSVG.append('g')
			.attr({
				'class' 	: 'chart deputy',
			});

		g.append('rect').attr({
			'class':'gchart',
		});

		g.append('rect')
			.attr('class', 'selectorRect')
			.attr('opacity', '0');

		g.append("g")
		.classed("axis x", true)

		g.append("g")
		.classed("axis y", true)



		selectors('deputy', dispatch.update );
		
		//update();
	}

	chart.on = dispatch.on;

	chart.update = update;
	function update() {
		g.transition().attr({
			transform 	:'translate('+ (_dimensions.x+margin.left) +','+ (_dimensions.y+margin.top) +')',
			width 		: _dimensions.width,
			height 		: _dimensions.height
		})

		_scale.x = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[1]; }))
			.range([ _dimensions.width-margin.right, margin.left ]);

		_scale.y = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[0]; }))
			.range([ margin.top, _dimensions.height-margin.bottom ]);

		g.select('.gchart').attr({
			width 		: _dimensions.width,
			height 		: _dimensions.height
		});

		g.select(".selectorRect")
			.attr('width', _dimensions.width)
			.attr('height', _dimensions.height)
			.style('fill', 'white') 
	
		// draw the x axis ------------------------------------------------------------------------------------------
		var xAxis = d3.svg.axis()
		.scale(_scale.x)
		.orient('bottom');

		var xg = g.select(".axis.x")
		.attr('transform', 'translate(0,' + _dimensions.height + ')')
		.transition()
		.call(xAxis);
		// ---------------------------------------------------------------------------------------------------------

		// draw the y axis ------------------------------------------------------------------------------------------
		var yAxis = d3.svg.axis()
		.scale(_scale.y)
		.orient('left');

		var yg = g.select(".axis.y")
		.attr('transform', 'translate(0,0)')
		.transition()
		.call(yAxis);
		// ---------------------------------------------------------------------------------------------------------
		
		var circles = g.selectAll("circle")
			.data(data, function(d,i){ if(d===undefined) return 1; else return d.deputyID});

		circles.enter().append("circle")
			.on("mouseover", mouseoverDeputy)
			.on("mouseout", mouseoutDeputy)
			.on("click", mouseClickDeputy)
			.attr('r',0)
			

		circles
		.transition().delay(100).duration(1000)
		.attr({
			cx: function (d) { return _scale.x(d.scatterplot[1]); },
			cy: function (d) { return _scale.y(d.scatterplot[0]); },
			class: function(d) { return (d.selected)? "node selected": ( (d.hovered)? "node hovered" : "node"); } ,
			id: function(d) { return "deputy-" + d.deputyID; },
			deputy: function(d) { return d.deputyID}
		})
		.attr(popoverAttr(deputyPopover))
		
		$('.chart.deputy circle.node').popover({ trigger: "hover" });
		function deputyPopover(d){
			return d.name +' ('+d.party+'-'+d.district+")<br /><em>Click to select</em>"
		}
		
		circles.attr({
			r: function(d){ return (d.hovered)? _dimensions.radius*2 : _dimensions.radius },
		})
		
		circles.style('fill',setDeputyFill )

		
		circles.exit().transition().duration(1000).attr('r',0).remove();

		g.selectAll("circle").sort( function (x,y) {
			if(x !== undefined)
				return (x.hovered);
				else false;
		})

	}
	chart.showRollCallCuttingPlane = function(rollCall){
		if(!rollCall){
			g.selectAll('.arrow').remove();
			g.selectAll('.cutting').remove();
			return;
		}
		var rollCallCoord = rollCall.coord;
		var arrow1 = [rollCallCoord[0]*_dimensions.width,rollCallCoord[1]*_dimensions.height]
		var arrow2 = [ (1-rollCallCoord[0])*_dimensions.width, (1-rollCallCoord[1])*_dimensions.height ]

		var relat = [ rollCallCoord[0]-0.5, rollCallCoord[1]-0.5];
		var a = Math.atan2(relat[1],relat[0]) 

		var cutting = [
				[[
				 _dimensions.width/2 - (_dimensions.width/2)*Math.sin(a),
				 _dimensions.height/2 + (_dimensions.height/2)*Math.cos(a)],
				[
				 _dimensions.width/2 + (_dimensions.width/2)*Math.sin(a),
				 _dimensions.height/2 - (_dimensions.height/2)*Math.cos(a)
				]
				]
			];

		var cuttingPlane = g.selectAll('.cutting')
						.data(cutting)

		cuttingPlane.enter()
			.append('path')
			.attr('class','cutting')
			.attr({
				d: function (d){ return 'M '+d[0][0]+' '+d[0][1]+' L'+d[1][0]+' '+d[1][1]; },
				stroke: 'grey',
				'stroke-width':"2px",
				'stroke-dasharray':'5,5,5'
			});

		var arrow= [
				[[_dimensions.width/2,_dimensions.height/2],  [arrow1[0],arrow1[1]] ],
				[ [arrow1[0]-7*Math.sin(a+Math.PI/4),arrow1[1]-7*Math.cos(a-3*Math.PI/4)],  [arrow1[0],arrow1[1]] ],
				[ [arrow1[0]-7*Math.cos(a+Math.PI/4),arrow1[1]+7*Math.sin(a-3*Math.PI/4)],  [arrow1[0],arrow1[1]] ],
				[[_dimensions.width/2,_dimensions.height/2],[arrow2[0],arrow2[1]]],
				[ [arrow2[0]+7*Math.sin(a+Math.PI/4),arrow2[1]+7*Math.cos(a-3*Math.PI/4)],  [arrow2[0],arrow2[1]] ],
				[ [arrow2[0]+7*Math.cos(a+Math.PI/4),arrow2[1]-7*Math.sin(a-3*Math.PI/4)],  [arrow2[0],arrow2[1]] ],
			]
		var coord = g.selectAll('.arrow')
						.data(arrow)

		coord.enter().append('path').attr('class','arrow');

		coord.attr({
			d: function (d){ return 'M '+d[0][0]+' '+d[0][1]+' L'+d[1][0]+' '+d[1][1]; },
			stroke: function(d,i) { return (i<3)?'darkgreen':'darkred';},
			'stroke-width':"2px",
		})
	}


	chart.data = function(value) {
		if(!arguments.length) return data;
		data = value;

		return chart;
	}

	chart.scale = function() {
		return _scale;
	}

	chart.dimensions = function(value) {
		if(!arguments.length) return _dimensions;
		_dimensions = value;
		return chart;
	}

		chart.width = function(value) {
			if(!arguments.length) return _dimensions.width;
			_dimensions.width = value;
			return chart;
		}
		chart.height = function(value) {
			if(!arguments.length) return _dimensions.height;
			_dimensions.height = value;
			return chart;
		}
		chart.x = function(value) {
			if(!arguments.length) return _dimensions.x;
			_dimensions.x = value;
			return chart;
		}
		chart.y = function(value) {
			if(!arguments.length) return _dimensions.y;
			_dimensions.y = value;
			return chart;
		}
		chart.radius = function(value) {
			if(!arguments.length) return _dimensions.radius;
			_dimensions.radius = value;
			return chart;
		}

	function setDeputyFill( d ){ 
		if(d.vote != null){
			return CONGRESS_DEFINE.votoStringToColor[d.vote];
		}
		if(d.rate != null){
			if (d.rate == "noVotes")
				return 'grey' 
			else return CONGRESS_DEFINE.votingColor(d.rate)
		} else{ 
			return CONGRESS_DEFINE.getPartyColor(d.party)
		} 
	}

	// mouse OVER circle deputy
	function mouseoverDeputy(d) {
		d.hovered = true;
		dispatch.update();

	}	

	// mouse OUT circle deputy
	function mouseoutDeputy(d){ 
		d.hovered = false;
		dispatch.update()
	}

	function mouseClickDeputy(d){
		d3.event.preventDefault();
		
		if (d3.event.shiftKey){	
			// using the shiftKey deselect the deputy				
			d.selected = false;
		} else 
		if (d3.event.ctrlKey || d3.event.metaKey){
			// using the ctrlKey add deputy to selection
			d.selected = true;
		} 
		else {
			// a left click without any key pressed -> select only the deputy (deselect others)
			data.forEach(function (deputy) { deputy.selected = false; })
			d.selected = true;				
		}	
		dispatch.update()	
	}				

	return d3.rebind(chart, dispatch, "on");
}

/// TO CREATE AN ICON in the deputy circle!
// d3.select('.main').append('image')
//                 .attr("xlink:href", "http://www.dem.org.br/favicon.ico")
//                 .attr("x", "100")
//                 .attr("y", "100")
//                 .attr("width", "15")
//                 .attr("height", "15");



