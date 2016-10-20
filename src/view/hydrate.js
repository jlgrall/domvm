import { VTYPE } from './VTYPE';
import { isArr, isFunc } from '../utils';
import { isStyleProp, isSplProp, isEvProp, isDynProp } from './utils';
import { setAttr } from './attrs';
import { patchStyle, patchEvent } from './patch';
import { createView } from './createView';
import { views } from './ViewModel';
import { insertBefore } from './syncChildren';


// TODO: DRY this out. reusing normal patchAttrs here negatively affects V8's JIT
function patchAttrs2(vnode) {
	var nattrs = vnode.attrs;

	for (var key in nattrs) {
		var nval = nattrs[key];
		var isDyn = isDynProp(vnode.tag, key);

		if (isStyleProp(key))
			patchStyle(vnode);
		else if (isSplProp(key)) {}
		else if (isEvProp(key))
			patchEvent(vnode, key, nval);
		else if (nval != null)
			setAttr(vnode, key, nval, isDyn);
	}
}

//  TODO: DRY this out. reusing normal patch here negatively affects V8's JIT
export function hydrate(vnode, withEl) {
	if (vnode.el == null) {
		if (vnode.type === VTYPE.ELEMENT) {
			vnode.el = withEl || document.createElement(vnode.tag);

			if (vnode.attrs)
				patchAttrs2(vnode);

			if (isArr(vnode.body)) {
				vnode.body.forEach((vnode2, i) => {
					if (vnode2.type == VTYPE.VMODEL) {
						var vm = views[vnode2.vmid];
						vm._redraw(vnode, i);
						insertBefore(vnode.el, vm.node.el);
					}
					else if (vnode2.type == VTYPE.VVIEW) {
						var vm = createView(vnode2.view, vnode2.model, vnode2.key, vnode2.opts)._redraw(vnode, i);		// todo: handle new model updates
						insertBefore(vnode.el, vm.node.el);
					}
					else
						insertBefore(vnode.el, hydrate(vnode2));		// vnode.el.appendChild(hydrate(vnode2))
				});
			}
			else if (vnode.body != null && vnode.body !== "") {
				if (vnode.html)
					vnode.el.innerHTML = vnode.body;
				else
					vnode.el.textContent = vnode.body;
			}
		}
		else if (vnode.type === VTYPE.TEXT)
			vnode.el = withEl || document.createTextNode(vnode.body);
	}

	vnode.el._node = vnode;

	return vnode.el;
}