var canvas = document.getElementById("drawing");
var c = canvas.getContext("2d");
const DPR = window.devicePixelRatio || 1;
const $inputs = $("#inputs")
// canvas.width *= DPR;
// canvas.height *= DPR;

//Parameters
p = {
    lengthDivisor:  {label: "length divisor", value: 1.53, min: 0.5, max: 3.0, step: 0.01},
    interiorAngle:  {label: "interior angle", value: 1.0, min: -2, max: 2, step: 0.1},
    iterations:     {label: "iteration count", value: 13, min: 1, max: 15, step: 1},
    divisions:      {label: "divisions", value: 2, min: 1, max: 6, step: 1},
    angleOffset:    {label: "branch angle offset", value: 0.25, min: 0.0, max: 1.0, step: 0.05},
    angleDivisor:   {label: "branch angle divisor", value: 2.0, min: 1.0, max: 3.0, step: 0.05},
    initialLength:  {label: "initial length", value: 302, min: 1, max: 600, step: 1},
    trunkLength:    {label: "trunk length multiplier", value: 1.5, min: 0.5, max: 2.0, step: 0.1},
    lineWidth:      {label: "branch width multiplier", value: DPR * 1.6, min: 0.1, max: 4, step: 0.1},
    lengthExponent: {label: "branch width exponent", value: 1.9, min: 1.0, max: 3, step: 0.05},
};

//Register a parameter to be user-modifiable
function registerParameter(name, label, min, max, step) {
    var $div = $("<div />", {class: "input"});
    var $input = $("<input />", {
        type: "range",
        id: name,
        name: name,
        min, max, step, value: p[name].value
    });
    var $label = $("<label />", {for: name, });
    $input.bind("input", function() {
        p[name].value = parseFloat(this.value);
        $label.html(`<p class="value">${this.value}</p><p class="name">${label} =</p>`);
    });
    $input.trigger("input");
    $inputs.append($div);
    $div.append($input);
    $div.append($label);
}

//Register all the parameters
Object.keys(p).forEach(key => {
    registerParameter(
        key, 
        p[key].label,
        p[key].min, 
        p[key].max, 
        p[key].step);
});

//Register handler for re-generating the fractal image
document.getElementById("wrapper").onclick = function () {
    createfractal();
}

//Point object for convenience
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//Recursive function for generating the fractal
function recurse(x, y, length, angle, iteration) {
    if (iteration > p.iterations.value) return;
    let startWidth = Math.pow((p.iterations.value / (iteration + 1)) * p.lineWidth.value, p.lengthExponent.value);
    let endWidth = Math.pow((p.iterations.value / (iteration + 2)) * p.lineWidth.value, p.lengthExponent.value);
    let v = angle - Math.PI / 2;
    let l = length;
    if (iteration == 0) {
        l = length * p.trunkLength.value;
    }
    let points = [
        new Point(
            x + Math.cos(v + Math.PI) * (startWidth / 2),
            y + Math.sin(v + Math.PI) * (startWidth / 2)),
        new Point(
            x + Math.cos(v) * (startWidth / 2),
            y + Math.sin(v) * (startWidth / 2)),
        new Point(
            x + Math.cos(angle) * l + Math.cos(v) * (endWidth / 2),
            y + Math.sin(angle) * l + Math.sin(v) * (endWidth / 2)),
        new Point(
            x + Math.cos(angle) * l + Math.cos(v + Math.PI) * (endWidth / 2),
            y + Math.sin(angle) * l + Math.sin(v + Math.PI) * (endWidth / 2))
    ];
    c.arc(x, y, startWidth / 2, 0, 2 * Math.PI);
    c.beginPath();
    c.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < 4; i++) {
        c.lineTo(points[i].x, points[i].y);
    }
    c.closePath();
    c.arc(x, y, endWidth / 2, 0, 2 * Math.PI);
    c.fill();
    x += Math.cos(angle) * l;
    y += Math.sin(angle) * l;
    for (let i = 1; i <= p.divisions.value; i++) {
        delta = (Math.PI * p.interiorAngle.value) / p.divisions.value;
        recurse(
            x, y, 
            length / p.lengthDivisor.value, 
            angle + ((p.divisions.value / p.angleDivisor.value - i + p.angleOffset.value) * delta), 
            iteration + 1);
    }
}

//Function called to generate the fractal
function createfractal() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillColor = "black";
    recurse(500 * DPR, 1000 * DPR, p.initialLength.value * DPR, Math.PI * 1.5, 0);
}

//Generate the fractal with default settings
createfractal();