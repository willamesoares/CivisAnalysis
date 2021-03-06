
if(!d3.chart) d3.chart = {};

d3.chart.labelManager = function() {

	var flags = 
		{
			deputies:{
				selected:0,
				total:0
			},
			rollCalls:{
				selected:0,
				total:0,
				hovered: false
			}
		}

	var labels;
	var votesPieChart;

	var dispatch = d3.dispatch('update');
	chart.on = dispatch.on;
	var _dimensions;

	var deputies, parties, rollCalls;

	// @param dimensions : {x: , y: , width: , height: }
	function chart(svgContainer, dimensions) {
		_dimensions = dimensions;
		labels = svgContainer.append('g')
				.attr('transform', 'translate(' + (dimensions.x) + ',' + dimensions.y + ')')
				.attr('class','labels')

		labels.append('g').attr('class','parties')
		labels.append('g').attr('class','rollCalls')
		
		var deputiesLabel = labels.append('g').attr('class','deputies')
			.attr("transform", function(d){return "translate("+(_dimensions.deputiesLabel.x+30)+","+_dimensions.deputiesLabel.y+")"})
			
		// var circle = deputiesLabel.append('circle')
		// 			.attr({
		// 				r:_dimensions.deputiesLabel.width/2+8,
		// 				stroke: 'black',
		// 				'stroke-width': '2px',
		// 				'stroke-opacity': 0.2
		// 			})
		// 			.style('fill','transparent')
		// 			.on({
		// 				mouseover: function () {
		// 					circle.attr('stroke-width','4px');
		// 					d3.select('#btn-resetDeputies').classed('highlight',true);
		// 				},
		// 				mouseout: function () {
		// 					circle.attr('stroke-width','spx');
		// 					d3.select('#btn-resetDeputies').classed('highlight',false);
		// 				},
		// 				click: function() {
		// 					deputies.forEach(function (deputy) {
		// 						deputy.selected = true;
		// 					})
		// 					dispatch.update();
		// 				}
		// 			})

		votesPieChart = d3.chart.votesPieChart({labels:false});
		votesPieChart(deputiesLabel, {x:0, y:52, width:80, height:80} );


	}

	chart.deputies = function(deputyNodes){
		if(!arguments.length) return deputies;
		deputies = deputyNodes;
		flags.deputies.total = deputies.length;
		return chart;
	}

	chart.rollCalls = function(rollCallNodes){
		if(!arguments.length) return rollCalls;
		rollCalls = rollCallNodes;
		flags.rollCalls.total = rollCalls.length;
		return chart;
	}

	chart.parties = function(a_parties){
		if(!arguments.length) return parties;
		partiesMap = a_parties;
		return chart;
	}

	chart.update = function(){ 
		flags.rollCalls.hovered = null;
		flags.deputies.hovered = null;

		var deputiesSelected = [];
		var hoverCount = 0;
		deputies.forEach( function (deputy) {
			if(deputy.selected) deputiesSelected.push(deputy);
			if(deputy.hovered) {
				flags.deputies.hovered = deputy;
				hoverCount++;
			};
		})
		flags.deputies.selected = deputiesSelected.length;
		if(hoverCount>1) flags.deputies.hovered = null;
		if( (deputiesSelected.length == 1) && (flags.deputies.hovered == null) ) flags.deputies.hovered = deputiesSelected[0];

		var rollCallsSelected = [];
		rollCalls.forEach( function (rollCall) {
			if(rollCall.selected) rollCallsSelected.push(rollCall);
			if(rollCall.hovered) flags.rollCalls.hovered = rollCall;
		})
		flags.rollCalls.selected = rollCallsSelected.length;
		if( (rollCallsSelected.length == 1) && (flags.rollCalls.hovered == null) ) flags.rollCalls.hovered = rollCallsSelected[0];
		// var rollCallsSelected = [];
		// rollCalls.forEach( function (rollCall) {
		// 	if(rollCall.selected) rollCallsSelected.push(deputy);
		// })


		partiesLabel();
		deputiesLabel();
		rollCallsLabel();
	}

	function partiesLabel(){
		labels.select('.parties')
	}

	function deputiesLabel() {
		votesPieChart.visible(false);

		var cdy =-35; //(flags.rollCalls.selected != flags.rollCalls.total)? -25 : -15;

		labels.select('.deputies .texts').remove();

		var text1 = (flags.deputies.selected == flags.deputies.total)?
					(flags.deputies.total+' Deputies')
					:
					(flags.deputies.selected+' Deputies selected');

		var g = labels.select('.deputies').append('g').attr('class','texts')
						
		g.transition()
			.attr('opacity',1);

			g.append('text').text(text1)
				.attr({
					dy: cdy,
					'font-size': 'normal',
					fill:'grey',
					'text-anchor': 'middle'
				})

			g.append('text').text('colored by')
					.attr({
						dy: cdy +20,
						'font-size': 'normal',
						fill:'grey',
						'text-anchor': 'middle'
					})

		var text3 = ( (flags.rollCalls.selected != flags.rollCalls.total) || flags.rollCalls.hovered )?
					(
						(flags.rollCalls.hovered || (flags.rollCalls.selected==1) )? 
						'their vote in the Roll Call'
						:
						'their votes in the Roll Calls'
					)
					:
					'their party color';

			g.append('text').text(text3)
					.attr({
						dy: cdy +40,
						'font-size': 'normal',
						fill:'grey',
						'text-anchor': 'middle'
					})
			
		// paint the color label	
		if( (flags.rollCalls.selected != flags.rollCalls.total) || flags.rollCalls.hovered ){

			if( flags.rollCalls.hovered || (flags.rollCalls.selected==1) ){
				votesPieChart.visible(true);

				// one roll call selected
				var rollCall = flags.rollCalls.hovered;

				votesPieChart.rollCall(rollCall);
				votesPieChart.deputies(deputies);
				votesPieChart.update();
				votesPieChart.on('update', dispatch.update )

			}else{
				var gg = g.append('g').attr("transform", function(d){return "translate("+(0.8 *(-_dimensions.deputiesLabel.width/2))+","+cdy+")"})
				// many roll calls selected
				var width = 0.8 * (_dimensions.deputiesLabel.width/CONGRESS_DEFINE.votingColorGradient.length);
				CONGRESS_DEFINE.votingColorGradient.forEach( function(color,i){// console.log(color +' '+i) 
					gg.append('rect').attr({
							r : radius,
							x: i*width,
							y:  60,
							width : width,
							height: 10,
							fill: color,
							stroke: 'lighblue',
							'stroke-width': '1px'
						})
				})

				gg.append('text').text('Approves')
					.attr({
						dx: +_dimensions.deputiesLabel.width/2,
						dy:80,
						'font-size': 'small',
						fill:'grey',
					})

				gg.append('text').text('Disapproves')
					.attr({
						dx: 0,
						dy:80,
						'font-size': 'small',
						fill:'grey',
					})
			

				g.append('text').text('the selected motions')
					.attr({
						dy: 65,
						'font-size': 'small',
						fill:'grey',
						'text-anchor': 'middle'
					})
			}
		}
	}

	function rollCallsLabel() {
		//labels.select('.rollCalls')
		if( flags.rollCalls.hovered || (flags.rollCalls.selected==1) ){
				// DO NOTHING
		}else{
			$('#rollCallInfo').html(
				'<div class="panel panel-default" style="color:grey; margin-top:5px; font-size: normal;height: '+(rollCallsScatterplot.height())+'px;">'+
					'<div class="panel-body style="" ><div>'+
						flags.rollCalls.selected +
						((flags.rollCalls.total == flags.rollCalls.selected)?
							' Roll Calls in the spectrum '
							:
							' Roll Calls selected '
						) + 
						'colored '+
						(
							(flags.deputies.hovered)? 
							(
								'by the votes of Deputy: '+
								flags.deputies.hovered.name+'</br>'
								//'Possible Votes: '
							)
							:
							(
								'by the votes of '+
								((flags.deputies.total == flags.deputies.selected)?
									'all Deputies in the Chamber'
									:
									'the '+flags.deputies.selected+' selected Deputies'
								)
							)
						)+'</div>'+
					'</div>'+
				'</div>'
			)

			// var svg = d3.select('#rollCallInfo .panel-body div')
			// 	.append('svg')
			// 	.attr('height', rollCallsScatterplot.height()-30)		
			
			// var votes = ["Sim","Não","Abstenção","Obstrução","Art. 17","null"];
			// if(flags.deputies.hovered){
			// 	votes.forEach( function (vote,i) {
			// 		svg.append('circle')
			// 			.attr({
			// 				r:radius*2,
			// 				fill:CONGRESS_DEFINE.votoStringToColor[vote],
			// 				cx:30,
			// 				cy:i*20+15,
			// 			})
			// 		svg.append('text').attr('fill','grey')
			// 			.text(vote)
			// 			.attr({
			// 				x:30+radius*2.5,
			// 				y:i*20+15+radius,
			// 			})
			// 	});
			// }
			// else{} 
		}
	}

	return d3.rebind(chart, dispatch, "on");
}

