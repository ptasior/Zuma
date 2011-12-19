var balls = new Array();
var b = new Bezier();

var c;
var ctx;
var image;
var md;
var moved;
var pe;

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

function Bezier()
{
	this.points = new Array();
	this.arcLen = 0;
	
	this.bno = function (n, k)
	{
		var ret = 1;
		for(var l = 1; l <= k; l++)
			ret *= (n-l+1)/l;
		
		return ret;
	};
	
	this.val = function(t)
	{
		var n = this.len(), coef;
		var p = new Point(0, 0);
		
		for(var i = 0; i < n; i++)
		{
			coef = Math.pow(1-t, n-i-1)*Math.pow(t,i)*this.bno(n-1,i);
			p.x += this.points[i].x*coef;
			p.y += this.points[i].y*coef;
		}
		return p; 
	};
	
	this.addPoint = function(p){
			this.points.push(p);
			this.calcLen();
		};
		
	this.movePoint = function(i, x, y){
			this.points[i].x = x;
			this.points[i].y = y;
			this.calcLen();
		};

	this.len = function(){
			return this.points.length;
		};
	
	this.closeTo = function(p, dist)
	{
		for(var i = 0; i < this.len(); i++)
			if(this.points[i].distance(p) < dist)
				return i;
		return -1;
	}
	
	this.calcLen = function()
	{
		var eps = 0.01;
		this.arcLen = 0;
		
		var pp = this.val(0), pn;
		for(var i = eps; i <= 1; i+=eps)
		{
			pn = this.val(i);
			this.arcLen += pp.distance(pn);
			pp = pn;
		}
	}

	this.speed = function(t)
	{
		var eps = 0.01;
		pp = this.val(t+eps);
		pn = this.val(t);
		
		return (pp.distance(pn)*this.len())/this.arcLen;
	}
}

function Ball(t)
{
	this.t = t;
	this.colorR = Math.random()*255;
	this.colorG = Math.random()*255;
	this.colorB = Math.random()*255;
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
			
			moved = b.closeTo(new Point(mx, my), 8);

			if(moved == -1)
				b.addPoint(new Point(mx, my));
			
			repaint();
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
			
			b.movePoint(moved, Event.pointerX(e)-this.offsetLeft, Event.pointerY(e)-this.offsetTop);
			
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
	
	for(var i = 0; i < b.len(); i++)
		ctx.drawCircle(b.points[i].x, b.points[i].y, 5);

	drawCurve();
	drawBalls();
}


function drawCurve()
{
	var pp = b.val(0), p;
	for(var t = 0.01; t <= 1; t+=0.01)
	{
		p = b.val(t);
		ctx.drawLine(pp.x, pp.y, p.x, p.y);
		pp = p;
	}
}

function drawBalls()
{
	for(var i = 0; i < balls.length; i++)
	{
		var p = b.val(balls[i].t);
		ctx.drawCircle(p.x, p.y, 10);
	}
}

window.onload = function(){
	init();
	b.addPoint(new Point(10,15));
	b.addPoint(new Point(10,255));
	b.addPoint(new Point(400,105));
	b.addPoint(new Point(300,335));
	repaint();
};

function start()
{
	if(pe)
		pe.stop();
	balls.push(new Ball(0));
	balls.push(new Ball(0.05));
	pe = new PeriodicalExecuter(function(pe) {
			for(var i = 0; i < balls.length; i++)
				balls[i].t += 0.05*b.speed(balls[i].t);
			repaint();
		}, 0.05);
}
