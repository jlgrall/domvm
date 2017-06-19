export let isStream = function() { return false };

let streamVal = null;
let subStream = null;
let unsubStream = null;

export function streamCfg(cfg) {
	isStream	= cfg.is;
	streamVal	= cfg.val;
	subStream	= cfg.sub;
	unsubStream	= cfg.unsub;
}

// creates a one-shot self-ending stream that redraws target vm
// TODO: if it's already registered by any parent vm, then ignore to avoid simultaneous parent & child refresh
export function hookStream(s, vm) {
	if (FEAT_STREAM) {
		var redrawStream = subStream(s, val => {
			// this "if" ignores the initial firing during subscription (there's no redrawable vm yet)
			if (redrawStream) {
				// if vm fully is formed (or mounted vm.node.el?)
				if (vm.node != null)
					vm.redraw();
				unsubStream(redrawStream);
			}
		});

		return streamVal(s);
	}
}