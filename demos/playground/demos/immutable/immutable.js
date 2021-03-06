var el = domvm.defineElement,
	diff = function(vm, state) {
		return [state];
	},
	hooks = {
		willRedraw: function(vm) {
			console.log(vm.view.name);
		}
	},
	vw = function(viewFn, data, key, opts) {
		return domvm.defineView(viewFn, data, key, {diff: diff, hooks: hooks});		// merge opts/diff
	};

var freezer = new Freezer({
	a: {x: 1, y: 2, z: [0, 1, 2] },
	b: [ 5, 6, 7 , { m: 1, n: 2 } ],
	c: 'Hola',
	d: null
});

function ViewA() {
	return function(vm, store) {
		return el("div", [
			el("em", store.a.x),
			vw(ViewB, store.b),
			vw(ViewB3, store.b[3]),
		]);
	};
}

function ViewB() {
	return function(vm, b) {
		return el("div", [
			b[1],
			vw(ViewB3, b[3]),
		]);
	};
}

function ViewB3(vm) {
	return function(vm, b3) {
		return el("div", b3.m);
	};
}

var rootVm = domvm.createView(ViewA, freezer.get(), null, {hooks: hooks, diff: diff}).mount(document.body);

freezer.on('update', function(currentState, prevState) {
	rootVm.update(currentState);
});

setTimeout(function() {
	freezer.get().pivot()
	.a.set({x: 5})
	.b.set(1, 99);
}, 1000);

setTimeout(function() {
	freezer.get().b[3].set({m: 43});
}, 3000);