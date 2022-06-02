<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-table
              title="Исходные данные"
              :rows="rowsDefaultData"
              :columns="columnsDefaultData"
              row-key="name"
              hide-bottom
              separator="cell"
              :pagination="{rowsPerPage: 0}"
              dense
            >
              <template v-slot:top-right>
                <q-btn
                  label="Изменить данные"
                  no-caps
                  flat
                  color="primary"
                  @click="dataDialog = true"
                ></q-btn>
              </template>
            </q-table>
          </div>
          <div class="col-12">
            <q-table
              title="Расстояние"
              :rows="[{va: 1, ed: 'км', am: 20},{va: 5, ed: 'км', am: 27},{va: 10, ed: 'км', am: 30},{va: 15, ed: 'км', am: 33},{va: 20, ed: 'км', am: 35},{va: 25, ed: 'км', am: 37},{va: 30, ed: 'км', am: 40}]"
              :columns="[{name: 'va', field: 'va', label: 'Значение', align: 'left'}, {name: 'ed', field: 'ed', label: 'Ед. измерения', align: 'left'}, {name: 'am', field: 'am', label: 'Am(R)', align: 'left'}]"
              row-key="name"
              hide-bottom
              separator="cell"
              :pagination="{rowsPerPage: 0}"
              dense
            ></q-table>
          </div>
        </div>
      </div>
      <div class="col-8">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <canvas id="chart"></canvas>
          </div>
          <div class="col-12">
            <q-table
              title="Результаты вычислений"
              :rows="rowsComputedData"
              :columns="columnsComputedData"
              row-key="name"
              hide-bottom
              separator="cell"
              :pagination="{rowsPerPage: 0}"
              dense
            ></q-table>
          </div>
        </div>
      </div>
    </div>
    <q-dialog
      v-model="dataDialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-bar class="bg-dark text-white">
          <q-space />

          <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
            <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary">Maximize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <div class="text-h6">Внесение изменений в исходные данные</div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-sm">
          <div class="col-4">
            <q-input
              type="number"
              v-model="_rbc"
              outlined
              label="Рбс (Вт)"
              hint="мощность передатчика БС в мВт"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_g1"
              outlined
              label="g1"
              hint="коэффициент усиления антенны БС в дБ"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_h1"
              outlined
              label="h1"
              hint="высота антенны в м"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_h2"
              outlined
              label="h2"
              hint="высота антенны в м"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_y"
              outlined
              label="Y"
              hint="мрад"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_dh"
              outlined
              label="dh"
              hint="м"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_f"
              outlined
              label="f"
              hint="рабочая частота, МГц"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_nL"
              outlined
              label="nL"
              hint="число"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_rbcDB"
              outlined
              label="Рбс (dB)"
              hint="мощность передатчика БС в дБ"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              type="number"
              v-model="_acf"
              outlined
              label="a=C/f"
              hint="с - скорость распространения электромагнитной энергии, с = 3* 105 км/сек, тогда f - в кГц"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              outlined
              :label="10**(-8.5)"
              hint="Pm"
              disable
            ></q-input>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-space></q-space>
          <q-btn
            @click="saveProperty"
            v-close-popup
            color="primary">Сохранить</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {ref, computed, onMounted, inject} from 'vue'
import { useQuasar } from 'quasar'
import { Chart, registerables } from 'chart.js';

const columnsDefaultData = [
  { name: 'per', field: 'per', label: 'Переменная', align: 'left' },
  { name: 'val', field: 'val', label: 'Значение', align: 'left' },
  { name: 'ed', field: 'ed', label: 'Измерение ед', align: 'left' },
]

const columnsComputedData = [
  { name: 'po', field: 'po', label: 'Po', align: 'left' },
  { name: 'potrue', field: 'potrue', label: 'Po (правильно)', align: 'left' },
  { name: 'pofalse', field: 'pofalse', label: 'Po (не правильно)', align: 'left' },
  { name: 'pm', field: 'pm', label: 'Pm', align: 'left' },
  { name: 'pmv', field: 'pmv', label: 'Pm (правильно)', align: 'left' },
  { name: 'h', field: 'h', label: 'H', align: 'left' },
  { name: 'hv', field: 'hv', label: 'H результат', align: 'left' }
]

export default ({
  name: 'IndexPage',
  setup() {
    const $q = useQuasar()
    Chart.register(...registerables)

    const firebase = inject('firebase')

    const dataDialog = ref(false)
    const maximizedToggle = ref(true)

    const rbc = ref(null)
    const g1 = ref(null)
    const h1 = ref(null)
    const h2 = ref(null)
    const y = ref(null)
    const dh = ref(null)
    const f = ref(null)
    const nL = ref(null)
    const rbcDB = ref(null)
    const acf = ref(null)
    const Pm = ref(null)

    const _rbc = ref(null)
    const _g1 = ref(null)
    const _h1 = ref(null)
    const _h2 = ref(null)
    const _y = ref(null)
    const _dh = ref(null)
    const _f = ref(null)
    const _nL = ref(null)
    const _rbcDB = ref(null)
    const _acf = ref(null)


    const rowsDefaultData = computed(() => [
      { per: 'Рбс', val: rbc.value, ed: 'Вт' },
      { per: 'g1', val: g1.value, ed: 'дБ' },
      { per: 'h1', val: h1.value, ed: 'м' },
      { per: 'h2', val: h2.value, ed: 'м' },
      { per: 'Y', val: y.value, ed: 'мрад' },
      { per: 'dh', val: dh.value, ed: 'м' },
      { per: 'f', val: f.value, ed: 'МГц' },
      { per: 'nL', val: nL.value, ed: '' },
      { per: 'Рбс(dB)', val: rbcDB.value, ed: 'дБ' },
      { per: 'a=C/f', val: acf.value, ed: '' },
      { per: 'Pm', val: Pm.value, ed: '' }
    ])

    const rowsComputedData = computed(() => [
      {
        po: 1,
        potrue: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(1/acf.value)),
        pofalse: 10*Math.log10(Pm.value*1**(-4)),
        pm: 1,
        pmv: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(1/acf.value))-20+20*Math.log10(h1.value/200)+10*Math.log10(h2.value/3),
        h: 'H(hбс,R)<10',
        hv: 20*Math.log10(h1.value/200)
      },
      {
        po: 2,
        potrue: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(5/acf.value)),
        pofalse: 10*Math.log10(Pm.value*5**(-4)),
        pm: 2,
        pmv: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(5/acf.value))-27+20*Math.log10(h1.value/200)+10*Math.log10(h2.value/3),
        h: 'H(hбс,R)>10',
        hv: 30*Math.log10(h1.value/200)
      },
      {
        po: 3,
        potrue: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(10/acf.value)),
        pofalse: 10*Math.log10(Pm.value*10**(-4)),
        pm: 3,
        pmv: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(10/acf.value))-30+20*Math.log10(h1.value/200)+10*Math.log10(h2.value/3),
        h: 'H(hмс,f)',
        hv: 10*Math.log10(h2.value/3)
      },
      {
        po: 4,
        potrue: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(15/acf.value)),
        pofalse: 10*Math.log10(Pm.value*15**(-4)),
        pm: 4,
        pmv: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(15/acf.value))-33+20*Math.log10(h1.value/200)+10*Math.log10(h2.value/3)
      },
      {
        po: 5,
        potrue: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(20/acf.value)),
        pofalse: 10*Math.log10(Pm.value*20**(-4)),
        pm: 5,
        pmv: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(20/acf.value))-35+20*Math.log10(h1.value/200)+10*Math.log10(h2.value/3)
      },
      {
        po: 5,
        potrue: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(25/acf.value)),
        pofalse: 10*Math.log10(Pm.value*25**(-4)),
        pm: 5,
        pmv: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(25/acf.value))-37+20*Math.log10(h1.value/200)+10*Math.log10(h2.value/3)
      },
      {
        po: 6,
        potrue: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(30/acf.value)),
        pofalse: 10*Math.log10(Pm.value*30**(-4)),
        pm: 6,
        pmv: 10*Math.log10(rbc.value)+g1.value-20*Math.log10(4*Math.PI*(30/acf.value))-40+20*Math.log10(h1.value/200)+10*Math.log10(h2.value/3)
      },
    ])

    const $labels = [0, 5, 10, 15, 20, 25, 30, 35]
    const $data = () => {
      return {
        labels: $labels,
        datasets: [
          {
            label: 'Затухания',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: rowsComputedData.value.map(a => a.pmv)
          }
        ]
      }
    }
    const $conf = {
      type: 'line',
      data: $data()
    }

    const chart = ref(null)

    onMounted(() => {
      const $ctx = document.getElementById('chart')
      chart.value = new Chart($ctx, $conf)
      firebase('modelOkamura').then(snapshot => {
        dh.value = _dh.value = snapshot.dh
        f.value = _f.value = snapshot.f
        g1.value = _g1.value = snapshot.g1
        h1.value = _h1.value = snapshot.h1
        h2.value = _h2.value = snapshot.h2
        nL.value = _nL.value = snapshot.nL
        rbc.value = _rbc.value = snapshot.rbc
        rbcDB.value = _rbcDB.value = snapshot.rbcDB
        y.value = _y.value = snapshot.y
        acf.value = _acf.value = snapshot.acf
        Pm.value = snapshot.Pm
        saveProperty()
      }).catch(error => {
        $q.notify({
          message: error.message,
          type: 'negative'
        })
      })
    })

    const saveProperty = () => {
      rbc.value = _rbc.value
      g1.value = _g1.value
      h1.value = _h1.value
      h2.value = _h2.value
      y.value = _y.value
      dh.value = _dh.value
      f.value = _f.value
      nL.value = _nL.value
      rbcDB.value = _rbcDB.value
      acf.value = _acf.value
      $q.notify({
        message: 'Обновлено!',
        type: 'positive'
      })

      chart.value.data.datasets[0].data = rowsComputedData.value.map(a => a.pmv)
    }

    return {
      columnsDefaultData,
      rowsDefaultData,
      rbc,
      g1,
      h1,
      h2,
      y,
      dh,
      f,
      nL,
      rbcDB,
      acf,
      Pm,
      _rbc,
      _g1,
      _h1,
      _h2,
      _y,
      _dh,
      _f,
      _nL,
      _rbcDB,
      _acf,
      dataDialog,
      maximizedToggle,
      saveProperty,
      columnsComputedData,
      rowsComputedData
    }
  }
})
</script>
