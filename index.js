const vuexLocal = new VuexPersistence.VuexPersistence({
    key: 'journeymap',
    storage: window.localStorage,
});
function uuid(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}; // thx, https://gist.github.com/jed/982883
const store = new Vuex.Store({
    state: { // start with one (later, have this as active and many more)
        active: {
            id: uuid(),
            steps: [
                {
                    id: uuid(),
                    title: 'step1',
                },
            ],
        },
    },
    mutations: {
        ADD_STEP(state, {afterIndex}) {
            state.active.steps.splice(afterIndex + 1, 0, {
                id: uuid(),
            });
        },
        DELETE_STEP(state, {stepIndex}) {
            state.active.steps.splice(stepIndex, 1);
        },
        EDIT_STEP(state, {step, field, value}) {
            step[field] = value;
        },
    },
    actions: {
    },
    plugins: [vuexLocal.plugin],
});
const app = Vue.createApp({
    store,
    data: () => ({
        checkedSteps: [], // 0, 1, 2, 3 - show next one depending on that
        step: 0,
    }),
    computed: {
        active() {
            return store.state.active;
        },
    },
    methods: {
        addStep(afterIndex) {
            store.commit('ADD_STEP', {afterIndex});
        },
        deleteStep(stepIndex) {
            if (window.confirm('Sure delete?')) {
                store.commit('DELETE_STEP', {stepIndex});
            }
        },
    },
});
app.component('smart-input', {
    props: ['step', 'field', 'disabled'], // (just for info)
    template: `
        <span @click="startEdit" :className="'smart-input ' + (editing ? null : (step[field] ? 'filled' : 'empty'))">{{editing ? null : (step[field] || '-')}}<input type="text" ref="input" :disabled="disabled" :className="editing ? null : 'hidden'"  :placeholder="field" :value="step[field] || ''" @blur="edit($event)" @keydown.enter="edit($event)" v-if="editing"/></span>
    `,
    data: () => ({
        editing: false,
    }),
    methods: {
        startEdit() {
            if (this.disabled) {
                return;
            }
            this.editing = true;
            setTimeout(() => {
                this.$refs.input.focus();
                this.$refs.input.select();
            });
        },
        edit(evnt) {
            this.editing = false;
            store.commit('EDIT_STEP', {step: this.step, field: this.field, value: evnt.target.value});
        },
    },
});
app.mount('#app');
