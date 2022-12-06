<template>
  <div class="make-pano-wrapper">
    <section :class="['side-btn', {'show': visibleSideBtn}]">
      <a v-for="(btn, index) in sideBtns" :key="index" :href="btn.href" target="_blank">
        <img :src="btn.imageUrl" :alt="btn.alt">
      </a>
    </section>
    <section>
      <el-radio-group v-model="makeType" @change="onChangeMakeType">
        <el-radio :label="ESplitImageType.cube">普通切图（立方体）</el-radio>
        <el-radio :label="ESplitImageType.tiles">高清切图（多分辨率）</el-radio>
        <el-radio :label="ESplitImageType.all">高清&普通</el-radio>
      </el-radio-group>
    </section>
    <section>
      <div class="select-file">
        <template v-if="!imageUrl">
          <el-button type="primary" @click="selectImage" v-throttle>
            选择图片
            <el-icon class="el-icon--right">
              <Upload/>
            </el-icon>
          </el-button>
          <div class="upload-tips">
            <a class="download-test-file" @click="downloadTestImage" v-throttle>下载测试图片 </a>
            <span>图片要求jpeg(jpg)、宽高比为2:1、分辨率不超过20000x10000</span>
          </div>
        </template>
        <img v-else :src="imageUrl" alt="">
      </div>
      <input class="pano-input" ref="panoInput" type="file" accept="image/jpeg" @change="onFileChange">
    </section>
    <section v-if="resultTips" :class="['result-tips', {error: hasError}]">
      {{ resultTips }}
    </section>
    <section class="foot">
      <el-button type="primary" plain @click="reset" v-throttle>重置</el-button>
      <el-button type="primary" :disabled="!imageUrl" @click="makePano" v-throttle>开始切图</el-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import {Upload} from '@element-plus/icons-vue'
import {ref, reactive, getCurrentInstance, onMounted, computed} from 'vue'
import {ElLoading, ElMessage} from 'element-plus'

import KrpanoToolJS from '@krpano/js-tools'

import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { urlToBinaryContent} from '../utils/utils'
import {packageTourXml} from '../utils/krpano'

enum ESplitImageType {
  cube = "cube",
  tiles = "tiles",
  all = "all"
}
/**
 * 切图返回的结果
 */
interface IConvertPanoResult {
  dirName: string;
  content: Blob | null;
  duration: string | number;
  code: {
    scene: string;
    cubeImage: string;
    tileImage?: string;
    shortTileImage?: string;
  };
}


const makeType = ref(ESplitImageType.cube)
const imageUrl = ref('')
const instance = getCurrentInstance()
const inputFile = ref()
const resultTips = ref('')
const hasError = ref<Boolean>(false)
const visibleSideBtn = ref<Boolean>(false)
const panoInput = ref<null | HTMLElement>(null)
const isDownloading = ref<Boolean>(false)

const sideBtns = reactive([
  {
    href: 'https://github.com/IrisPro/KrpanoToolJS',
    imageUrl: new URL(`../assets/github.jpeg`, import.meta.url).href,
    alt: 'github',
  },
  {
    href: 'https://www.npmjs.com/package/@krpano/js-tools',
    imageUrl: new URL(`../assets/npm.jpg`, import.meta.url).href,
    alt: 'npm',
  },
  {
    href: 'https://juejin.cn/post/7150895121444110344',
    imageUrl: new URL(`../assets/juejin.jpeg`, import.meta.url).href,
    alt: '掘金',
  },
])

onMounted(() => {
  console.log('version - 1.1.14')
  setTimeout(() => {
    visibleSideBtn.value = true
  }, 2000)
})

function selectImage() {
  panoInput.value?.click()
}

function onChangeMakeType() {
  hasError.value = false
  resultTips.value = ''
}

function onFileChange(e: any) {
  const file = e.target.files[0]
  inputFile.value = file
  if (!file) return
  imageUrl.value = URL.createObjectURL(file)
  panoInput.value = null
}

function makePano() {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    body: true,
    fullscreen: true,
    background: 'rgba(0, 0, 0, 0.7)'
  })
  let makeFunc
  if (makeType.value === ESplitImageType.cube) {
    makeFunc = 'makeCube'
  } else if (makeType.value === ESplitImageType.tiles) {
    makeFunc = 'makeTiles'
  } else {
    makeFunc = 'makeCubeAndTiles'
  }

  const krpanoTool = new KrpanoToolJS()
  krpanoTool[makeFunc](inputFile.value).then((reslut: IConvertPanoResult) => {
    packageVtour(reslut)
    hasError.value = false
    loading.close()
  }).catch((error: any) => {
    ElMessage({
      showClose: true,
      message: '出错了，内存不足，建议使用chrome浏览器',
      type: 'error',
      duration: 4
    })
    hasError.value = true
    resultTips.value = '出错了，内存不足，建议使用chrome浏览器'
    loading.close()
    reset()
  })
}

async function packageVtour(reslut: IConvertPanoResult) {
  const zip = new JSZip()
  const folder = zip.folder('场景_' + reslut.dirName.replace('.tiles', '')) as JSZip

  folder.file('tour.xml', packageTourXml(reslut.code.scene))
  await folder.folder('panos')?.loadAsync(reslut.content as Blob)
  await folder.loadAsync(urlToBinaryContent(new URL(`../assets/krpanoTemplate/files.zip`, import.meta.url).href))

  zip
      .generateAsync({
        type: 'blob'
      })
      .then(content => {
        resultTips.value = `切图完成，耗时：${reslut.duration}，解压即可预览效果`
        FileSaver.saveAs(content)
      })
}

function reset() {
  imageUrl.value = ''
  resultTips.value = ''
  hasError.value = false
  makeType.value = ESplitImageType.cube
}

async function downloadTestImage() {
  if (isDownloading.value) return
  isDownloading.value = true

  const zip = new JSZip()
  const folder = zip.folder('测试全景图') as JSZip
  await folder.loadAsync(urlToBinaryContent(new URL(`../assets/testImage/files.zip`, import.meta.url).href))

  zip
      .generateAsync({
        type: 'blob'
      })
      .then(content => {
        FileSaver.saveAs(content)
        ElMessage({
          showClose: true,
          message: '开始下载测试全景图',
          type: 'success'
        })
        isDownloading.value = false
      })
}

</script>


<style scoped lang="less">
.make-pano-wrapper {
  position: relative;
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;

  .side-btn {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    right: 0;
    width: 0;
    height: 0;
    background: #FFFFFF;
    border-radius: 25px;
    top: 50%;
    overflow: hidden;
    transform: translate(calc(100% + 10px), -50%);
    cursor: pointer;
    transition: width 0.6s;

    &.show {
      height: 220px;
      width: 50px;
    }

    img {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      transition: zoom 0.6s;
    }

    img:hover {
      transform: scale(1.3);
    }
  }

  > section {
    margin-bottom: 20px;

    .pano-input {
      display: none;
    }
  }

  .select-file {
    width: 460px;
    height: 230px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 8px 0 #247ac469;
    border-radius: 10px;
    overflow: hidden;

    > img {
      width: 100%;
      height: 100%;
    }
  }

  .upload-tips {
    margin-top: 20px;
    font-size: 12px;
    color: gray;

    .download-test-file {
      color: #409eff;
      cursor: pointer;
      &:hover {
        color: #006fff;
        text-decoration: underline;
      }
    }
  }

  .result-tips {
    color: #16d906;
    font-size: 14px;
    text-align: center;

    > .error {
      color: red;
    }
  }

  .foot {
    text-align: center;
    margin-bottom: 0;
  }
}
</style>

