var Canvas = require('canvas')
  , canvas = new Canvas.Canvas(1366, 669)
  , ctx = canvas.getContext('2d');

const DB = require('./DB').DB;

DB.query("select * from drawing_coordinates")
  .then((coordinates) => {
    coordinates.map(draw);
  })

draw = (row) => {
  console.log("coordinate is", row);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = row.color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  // ctx.font = '30px Impact';
  // ctx.rotate(.1);
  // ctx.fillText("Awesome!", 50, 100);

  // var te = ctx.measureText('Awesome!');
  // ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.lineTo(row.x0, row.y0);
  ctx.lineTo(row.x0, row.y0);
  ctx.stroke();
  console.log('<img src="' + canvas.toDataURL() + '" />');
  return 1;
}
