
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group) {
        const value = [];
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.push(group[i].__value);
        }
        return value;
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Modal.svelte generated by Svelte v3.22.2 */

    const file = "src/Modal.svelte";
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    // (7:0) {#if showModal}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let dispose;
    	const title_slot_template = /*$$slots*/ ctx[4].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[3], get_title_slot_context);
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (title_slot) title_slot.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "modal svelte-1t7hoez");
    			add_location(div0, file, 8, 8, 217);
    			attr_dev(div1, "class", "backdrop svelte-1t7hoez");
    			toggle_class(div1, "promo", /*isPromo*/ ctx[1]);
    			add_location(div1, file, 7, 4, 150);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (title_slot) {
    				title_slot.m(div0, null);
    			}

    			append_dev(div0, t);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div1, "click", self(/*click_handler*/ ctx[5]), false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 8) {
    					title_slot.p(get_slot_context(title_slot_template, ctx, /*$$scope*/ ctx[3], get_title_slot_context), get_slot_changes(title_slot_template, /*$$scope*/ ctx[3], dirty, get_title_slot_changes));
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    				}
    			}

    			if (dirty & /*isPromo*/ 2) {
    				toggle_class(div1, "promo", /*isPromo*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (title_slot) title_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(7:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showModal*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { message = "this is a modal" } = $$props;
    	let { showModal = false } = $$props;
    	let { isPromo = false } = $$props;
    	const writable_props = ["message", "showModal", "isPromo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['title','default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("isPromo" in $$props) $$invalidate(1, isPromo = $$props.isPromo);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ message, showModal, isPromo });

    	$$self.$inject_state = $$props => {
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("isPromo" in $$props) $$invalidate(1, isPromo = $$props.isPromo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showModal, isPromo, message, $$scope, $$slots, click_handler];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { message: 2, showModal: 0, isPromo: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get message() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isPromo() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isPromo(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/AddPersonForm.svelte generated by Svelte v3.22.2 */

    const { console: console_1 } = globals;
    const file$1 = "src/AddPersonForm.svelte";

    function create_fragment$1(ctx) {
    	let form;
    	let input0;
    	let t0;
    	let br0;
    	let t1;
    	let input1;
    	let t2;
    	let br1;
    	let t3;
    	let input2;
    	let t4;
    	let br2;
    	let t5;
    	let label0;
    	let t7;
    	let br3;
    	let t8;
    	let input3;
    	let t9;
    	let br4;
    	let t10;
    	let input4;
    	let t11;
    	let br5;
    	let t12;
    	let input5;
    	let t13;
    	let br6;
    	let t14;
    	let br7;
    	let t15;
    	let input6;
    	let t16;
    	let label1;
    	let t18;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			label0 = element("label");
    			label0.textContent = "skills";
    			t7 = space();
    			br3 = element("br");
    			t8 = space();
    			input3 = element("input");
    			t9 = text(" fighting ");
    			br4 = element("br");
    			t10 = space();
    			input4 = element("input");
    			t11 = text(" sneaking ");
    			br5 = element("br");
    			t12 = space();
    			input5 = element("input");
    			t13 = text(" running ");
    			br6 = element("br");
    			t14 = space();
    			br7 = element("br");
    			t15 = space();
    			input6 = element("input");
    			t16 = space();
    			label1 = element("label");
    			label1.textContent = "Belt Color";
    			t18 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Black";
    			option1 = element("option");
    			option1.textContent = "Orange";
    			option2 = element("option");
    			option2.textContent = "White";
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "name");
    			add_location(input0, file$1, 22, 4, 503);
    			add_location(br0, file$1, 23, 4, 564);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "beltcolor");
    			input1.disabled = true;
    			add_location(input1, file$1, 24, 4, 573);
    			add_location(br1, file$1, 24, 80, 649);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "placeholder", "age");
    			add_location(input2, file$1, 25, 4, 658);
    			add_location(br2, file$1, 26, 4, 720);
    			attr_dev(label0, "for", "skills");
    			add_location(label0, file$1, 31, 4, 978);
    			add_location(br3, file$1, 31, 39, 1013);
    			attr_dev(input3, "type", "checkbox");
    			input3.__value = "fighting";
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input3);
    			add_location(input3, file$1, 32, 4, 1022);
    			add_location(br4, file$1, 32, 74, 1092);
    			attr_dev(input4, "type", "checkbox");
    			input4.__value = "sneaking";
    			input4.value = input4.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input4);
    			add_location(input4, file$1, 33, 4, 1101);
    			add_location(br5, file$1, 33, 74, 1171);
    			attr_dev(input5, "type", "checkbox");
    			input5.__value = "running";
    			input5.value = input5.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input5);
    			add_location(input5, file$1, 34, 4, 1180);
    			add_location(br6, file$1, 34, 72, 1248);
    			add_location(br7, file$1, 35, 4, 1257);
    			attr_dev(input6, "type", "submit");
    			attr_dev(input6, "placeholder", "add person");
    			add_location(input6, file$1, 36, 4, 1266);
    			attr_dev(label1, "for", "beltColor");
    			add_location(label1, file$1, 37, 4, 1317);
    			option0.__value = "black";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 39, 8, 1403);
    			option1.__value = "orange";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 40, 8, 1448);
    			option2.__value = "white";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 41, 8, 1495);
    			if (/*beltColor*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[13].call(select));
    			add_location(select, file$1, 38, 4, 1363);
    			add_location(form, file$1, 21, 0, 452);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(form, t0);
    			append_dev(form, br0);
    			append_dev(form, t1);
    			append_dev(form, input1);
    			set_input_value(input1, /*beltColor*/ ctx[1]);
    			append_dev(form, t2);
    			append_dev(form, br1);
    			append_dev(form, t3);
    			append_dev(form, input2);
    			set_input_value(input2, /*age*/ ctx[2]);
    			append_dev(form, t4);
    			append_dev(form, br2);
    			append_dev(form, t5);
    			append_dev(form, label0);
    			append_dev(form, t7);
    			append_dev(form, br3);
    			append_dev(form, t8);
    			append_dev(form, input3);
    			input3.checked = ~/*skills*/ ctx[3].indexOf(input3.__value);
    			append_dev(form, t9);
    			append_dev(form, br4);
    			append_dev(form, t10);
    			append_dev(form, input4);
    			input4.checked = ~/*skills*/ ctx[3].indexOf(input4.__value);
    			append_dev(form, t11);
    			append_dev(form, br5);
    			append_dev(form, t12);
    			append_dev(form, input5);
    			input5.checked = ~/*skills*/ ctx[3].indexOf(input5.__value);
    			append_dev(form, t13);
    			append_dev(form, br6);
    			append_dev(form, t14);
    			append_dev(form, br7);
    			append_dev(form, t15);
    			append_dev(form, input6);
    			append_dev(form, t16);
    			append_dev(form, label1);
    			append_dev(form, t18);
    			append_dev(form, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*beltColor*/ ctx[1]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    				listen_dev(input3, "change", /*input3_change_handler*/ ctx[9]),
    				listen_dev(input4, "change", /*input4_change_handler*/ ctx[11]),
    				listen_dev(input5, "change", /*input5_change_handler*/ ctx[12]),
    				listen_dev(select, "change", /*select_change_handler*/ ctx[13]),
    				listen_dev(form, "submit", prevent_default(/*handelSubmit*/ ctx[4]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty & /*beltColor*/ 2 && input1.value !== /*beltColor*/ ctx[1]) {
    				set_input_value(input1, /*beltColor*/ ctx[1]);
    			}

    			if (dirty & /*age*/ 4 && to_number(input2.value) !== /*age*/ ctx[2]) {
    				set_input_value(input2, /*age*/ ctx[2]);
    			}

    			if (dirty & /*skills*/ 8) {
    				input3.checked = ~/*skills*/ ctx[3].indexOf(input3.__value);
    			}

    			if (dirty & /*skills*/ 8) {
    				input4.checked = ~/*skills*/ ctx[3].indexOf(input4.__value);
    			}

    			if (dirty & /*skills*/ 8) {
    				input5.checked = ~/*skills*/ ctx[3].indexOf(input5.__value);
    			}

    			if (dirty & /*beltColor*/ 2) {
    				select_option(select, /*beltColor*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input3), 1);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input4), 1);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input5), 1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let name;
    	let beltColor;
    	let age;
    	let skills = [];

    	const handelSubmit = () => {
    		console.log(name, age, beltColor, skills);

    		const person = {
    			name,
    			beltColor,
    			age,
    			skills,
    			id: Math.random()
    		};

    		dispatch("add_person", person);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AddPersonForm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AddPersonForm", $$slots, []);
    	const $$binding_groups = [[]];

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler() {
    		beltColor = this.value;
    		$$invalidate(1, beltColor);
    	}

    	function input2_input_handler() {
    		age = to_number(this.value);
    		$$invalidate(2, age);
    	}

    	function input3_change_handler() {
    		skills = get_binding_group_value($$binding_groups[0]);
    		$$invalidate(3, skills);
    	}

    	function input4_change_handler() {
    		skills = get_binding_group_value($$binding_groups[0]);
    		$$invalidate(3, skills);
    	}

    	function input5_change_handler() {
    		skills = get_binding_group_value($$binding_groups[0]);
    		$$invalidate(3, skills);
    	}

    	function select_change_handler() {
    		beltColor = select_value(this);
    		$$invalidate(1, beltColor);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		name,
    		beltColor,
    		age,
    		skills,
    		handelSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("beltColor" in $$props) $$invalidate(1, beltColor = $$props.beltColor);
    		if ("age" in $$props) $$invalidate(2, age = $$props.age);
    		if ("skills" in $$props) $$invalidate(3, skills = $$props.skills);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		beltColor,
    		age,
    		skills,
    		handelSubmit,
    		dispatch,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_change_handler,
    		$$binding_groups,
    		input4_change_handler,
    		input5_change_handler,
    		select_change_handler
    	];
    }

    class AddPersonForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddPersonForm",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.22.2 */
    const file$2 = "src/App.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (25:0) <Modal {showModal} on:click={toggleModal}>
    function create_default_slot(ctx) {
    	let current;
    	const addpersonform = new AddPersonForm({ $$inline: true });
    	addpersonform.$on("add_person", /*addPerson*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(addpersonform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addpersonform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addpersonform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addpersonform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addpersonform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(25:0) <Modal {showModal} on:click={toggleModal}>",
    		ctx
    	});

    	return block;
    }

    // (47:1) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "There is no value inside people array";
    			add_location(p, file$2, 47, 2, 1173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(47:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#if person.beltColor === 'black'}
    function create_if_block_1(ctx) {
    	let p;
    	let strong;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Master";
    			t1 = text(" Ninja");
    			add_location(strong, file$2, 34, 6, 849);
    			add_location(p, file$2, 34, 3, 846);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(p, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(34:2) {#if person.beltColor === 'black'}",
    		ctx
    	});

    	return block;
    }

    // (38:2) {#if person.skills}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*person*/ ctx[6].skills;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_1_else_1 = null;

    	if (!each_value_1.length) {
    		each_1_else_1 = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else_1) {
    				each_1_else_1.c();
    			}
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else_1) {
    				each_1_else_1.m(target, anchor);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*people*/ 1) {
    				each_value_1 = /*person*/ ctx[6].skills;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;

    				if (each_value_1.length) {
    					if (each_1_else_1) {
    						each_1_else_1.d(1);
    						each_1_else_1 = null;
    					}
    				} else if (!each_1_else_1) {
    					each_1_else_1 = create_else_block(ctx);
    					each_1_else_1.c();
    					each_1_else_1.m(each_1_anchor.parentNode, each_1_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else_1) each_1_else_1.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(38:2) {#if person.skills}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No skill is mentioned";
    			add_location(p, file$2, 41, 4, 1039);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(41:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:3) {#each person.skills as skill}
    function create_each_block_1(ctx) {
    	let p;
    	let t_value = /*skill*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$2, 39, 4, 1008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*people*/ 1 && t_value !== (t_value = /*skill*/ ctx[9] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(39:3) {#each person.skills as skill}",
    		ctx
    	});

    	return block;
    }

    // (31:1) {#each people as person (person.id)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let h4;
    	let t0_value = /*person*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*person*/ ctx[6].age + "";
    	let t3;
    	let t4;
    	let t5_value = /*person*/ ctx[6].beltColor + "";
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let button;
    	let t10;
    	let dispose;
    	let if_block0 = /*person*/ ctx[6].beltColor === "black" && create_if_block_1(ctx);
    	let if_block1 = /*person*/ ctx[6].skills && create_if_block$1(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*person*/ ctx[6], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = text(" years old, ");
    			t5 = text(t5_value);
    			t6 = text(" belt");
    			t7 = space();
    			if (if_block1) if_block1.c();
    			t8 = space();
    			button = element("button");
    			button.textContent = "Delete";
    			t10 = space();
    			add_location(h4, file$2, 32, 2, 783);
    			add_location(p, file$2, 36, 2, 893);
    			add_location(button, file$2, 44, 2, 1089);
    			add_location(div, file$2, 31, 1, 775);
    			this.first = div;
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(div, t7);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t8);
    			append_dev(div, button);
    			append_dev(div, t10);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*people*/ 1 && t0_value !== (t0_value = /*person*/ ctx[6].name + "")) set_data_dev(t0, t0_value);

    			if (/*person*/ ctx[6].beltColor === "black") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*people*/ 1 && t3_value !== (t3_value = /*person*/ ctx[6].age + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*people*/ 1 && t5_value !== (t5_value = /*person*/ ctx[6].beltColor + "")) set_data_dev(t5, t5_value);

    			if (/*person*/ ctx[6].skills) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div, t8);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:1) {#each people as person (person.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let main;
    	let button;
    	let t2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let dispose;

    	const modal = new Modal({
    			props: {
    				showModal: /*showModal*/ ctx[1],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("click", /*toggleModal*/ ctx[3]);
    	let each_value = /*people*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*person*/ ctx[6].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    			t0 = space();
    			main = element("main");
    			button = element("button");
    			button.textContent = "open modal";
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(button, file$2, 29, 1, 685);
    			attr_dev(main, "class", "svelte-1s0e019");
    			add_location(main, file$2, 28, 0, 677);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			mount_component(modal, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(main, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(main, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*toggleModal*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*showModal*/ 2) modal_changes.showModal = /*showModal*/ ctx[1];

    			if (dirty & /*$$scope*/ 4096) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);

    			if (dirty & /*handelClick, people*/ 5) {
    				const each_value = /*people*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, main, destroy_block, create_each_block, null, get_each_context);

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block_1(ctx);
    					each_1_else.c();
    					each_1_else.m(main, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let people = [
    		{
    			name: "yashi",
    			beltColor: "black",
    			age: 25,
    			id: 1
    		},
    		{
    			name: "mario",
    			beltColor: "orange",
    			age: 23,
    			id: 2
    		},
    		{
    			name: "lulgi",
    			beltColor: "brown",
    			age: 35,
    			id: 3
    		}
    	];

    	let showModal = false;

    	const handelClick = id => {
    		$$invalidate(0, people = people.filter(person => {
    			return person.id !== id;
    		}));
    	};

    	const toggleModal = () => {
    		$$invalidate(1, showModal = !showModal);
    	};

    	const addPerson = e => {
    		const person = e.detail;
    		$$invalidate(0, people = [person, ...people]);
    		toggleModal();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = person => handelClick(person.id);

    	$$self.$capture_state = () => ({
    		Modal,
    		AddPersonForm,
    		people,
    		showModal,
    		handelClick,
    		toggleModal,
    		addPerson
    	});

    	$$self.$inject_state = $$props => {
    		if ("people" in $$props) $$invalidate(0, people = $$props.people);
    		if ("showModal" in $$props) $$invalidate(1, showModal = $$props.showModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [people, showModal, handelClick, toggleModal, addPerson, click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
