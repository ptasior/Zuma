var points = new Array();

var c;
var ctx;
var image;
var md;
var moved;

function Point(_x, _y)
{
	this.x = _x;
	this.y = _y;
	
	this.distance = function(p)
	{
		dx = Math.abs(this.x - p.x);
		dy = Math.abs(this.y - p.y);
		return Math.sqrt(dx*dx + dy*dy);
	}
}

function init()
{
	c = $('canv');
	ctx = c.getContext('2d');
	image = ctx.createImageData(c.width, c.height);
	md = false;
	moved = -1;
	
	c.observe('mousedown', function(e){
			md = true;
			var mx = Event.pointerX(e)-this.offsetLeft;
			var my = Event.pointerY(e)-this.offsetTop;
			
			for(var i = 0; i < points.length; i++)
				if(points[i].distance(new Point(mx, my)) < 5)
					moved = i;

		});
	c.observe('mouseup', function(e){
			md = false;
			moved  =-1;
		});
	c.observe('mouseleave', function(e){
			md = false;
			moved  =-1;
		});
	c.observe('mousemove', function(e){
			if(!md || moved == -1)
				return;
			
			points[moved].x =  Event.pointerX(e)-this.offsetLeft;
			points[moved].y =  Event.pointerY(e)-this.offsetTop;
			
			repaint();
		});
	
	// Adding method to draw a circle
	ctx.drawCircle = function(x,y,r){
		this.beginPath();
		this.arc(x, y, r, 0, Math.PI*2, true);
		this.stroke();  
	}
	
	ctx.drawLine = function(x1, y1, x2, y2){
		ctx.beginPath();  
		ctx.moveTo(x1, y1);  
		ctx.lineTo(x2, y2); 
		this.stroke();  
	}
}

function repaint()
{
	ctx.clearRect(0,0,c.width, c.height);
	ctx.fillStyle = "rgb(200,0,0)"; 
	ctx.strokeStyle = "rgb(200,0,0)"; 
	
	for(var i = 0; i < points.length; i++)
		ctx.drawCircle(points[i].x, points[i].y, 5);
}

window.onload = function(){
	init();
	points.push(new Point(10,15));
	points.push(new Point(100,105));
	repaint();
	
};

