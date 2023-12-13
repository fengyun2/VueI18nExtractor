<template>
  <div class="basic-list">
    <section-layout
      v-loading="loading"
      :breadcrumbs="breadcrumbs"
      :name="pageTitle"
    >
      <template v-slot:header>
        <div>
          <page-header
            :title="pageTitle"
            content="表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。"
          />
        </div>
      </template>
      <template v-slot:content>
        <el-card>
          <el-form ref="form" label-width="30%" class="form" :model="ruleForm">
            <el-form-item label="标题" prop="title">
              <el-input
                maxlength="20"
                v-model:value="ruleForm.title"
                placeholder="给目标起个名字"
              ></el-input>
            </el-form-item>
            <el-form-item label="起止日期" prop="date">
              <el-date-picker
                v-model:value="ruleForm.date"
                :style="{ width: '100%' }"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="目标描述" prop="goal">
              <el-input
                v-model:value="ruleForm.goal"
                type="textarea"
                :style="{ minHeight: '32px' }"
                placeholder="请输入你的阶段性工作目标"
                :rows="4"
              />
            </el-form-item>
            <el-form-item label="衡量标准" prop="standard">
              <el-input
                v-model:value="ruleForm.standard"
                type="textarea"
                :style="{ minHeight: '32px' }"
                placeholder="请输入衡量标准"
                :rows="4"
              />
            </el-form-item>
            <el-form-item prop="client">
              <template v-slot:label>
                <span>
                  {{ $t('i18nKey_i59jmmtiau_客户') }}
                  <em class="optional">
                    {{ $t('i18nKey_jcpyotl2xo_（选填）') }}
                    <el-tooltip content="目标的服务对象" placement="top">
                      <el-icon
                        style="
                           {
                            marginright: 4px;
                          }
                        "
                        ><el-icon-info
                      /></el-icon>
                    </el-tooltip>
                  </em>
                </span>
              </template>
              <el-input
                v-model:value="ruleForm.client"
                placeholder="请描述你服务的{{ $t('i18nKey_i59jmmtiau_客户') }}，内部{{ $t('i18nKey_i59jmmtiau_客户') }}直接 @姓名／工号"
              ></el-input>
            </el-form-item>
            <el-form-item prop="invites">
              <template v-slot:label>
                <span>
                  {{ $t('i18nKey_x2d67kgcma_邀评人') }}
                  <em class="optional">{{ $t('i18nKey_jcpyotl2xo_（选填）') }}</em>
                </span>
              </template>
              <el-input
                v-model:value="ruleForm.invites"
                placeholder="请直接 @姓名／工号，最多可邀请 5 人 @姓名／工号"
              ></el-input>
            </el-form-item>
            <el-form-item prop="weight">
              <template v-slot:label>
                <span>
                  {{ $t('i18nKey_c59y2hcvap_权重') }}
                  <em class="optional">{{ $t('i18nKey_jcpyotl2xo_（选填）') }}</em>
                </span>
              </template>
              <el-input-number
                v-model:value="ruleForm.weight"
                placeholder="请输入"
                :min="0"
                :max="100"
                :controls="false"
              ></el-input-number>
              <span>%</span>
            </el-form-item>
            <el-form-item label="目标{{ $t('i18nKey_y2szypmmhd_公开') }}" prop="public">
              <div class="item-public">
                <el-radio-group v-model:value="ruleForm.public">
                  <el-radio label="1">{{ $t('i18nKey_y2szypmmhd_公开') }}</el-radio>
                  <el-radio label="2">部分{{ $t('i18nKey_y2szypmmhd_公开') }}</el-radio>
                  <el-radio label="3">不{{ $t('i18nKey_y2szypmmhd_公开') }}</el-radio>
                </el-radio-group>
                <el-form-item
                  v-show="ruleForm.public === '2'"
                  style="
                     {
                      marginbottom: 0;
                    }
                  "
                >
                  <el-select
                    v-model:value="ruleForm.publicUsers"
                    placeholder="{{ $t('i18nKey_y2szypmmhd_公开') }}给"
                    multiple
                    style="
                       {
                        margin: '8px 0';
                      }
                    "
                  >
                    <el-option value="1" label="同事甲" />
                    <el-option value="2" label="同事乙" />
                    <el-option value="3" label="同事丙" />
                  </el-select>
                </el-form-item>
                <div class="form-explain">{{ $t('i18nKey_i59jmmtiau_客户') }}、{{ $t('i18nKey_x2d67kgcma_邀评人') }}默认被分享</div>
              </div>
            </el-form-item>
            <el-form-item :style="{ marginTop: '32px' }">
              <el-button type="primary" native-type="submit" :loading="loading"
                >{{ $t('i18nKey_bsedsicgjh_提交') }}</el-button
              >
              <el-button :style="{ marginLeft: '8px' }">{{ $t('i18nKey_vf9n8e5a4b_保存') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>
    </section-layout>
  </div>
</template><script>
import { Info as ElIconInfo } from '@element-plus/icons'
import * as Vue from 'vue'
import { mapState } from 'vuex'
import SectionLayout from 'components/SectionLayout'
import PageHeader from 'components/PageHeader'
export default {
  components: {
    SectionLayout,
    PageHeader,
    ElIconInfo,
  },
  data() {
    return {
      loading: false,
      ruleForm: {
        title: '',
        date: '',
        goal: '',
        standard: '',
        client: '',
        invites: '',
        weight: '',
        public: '1',
        publicUsers: '',
      },
      queryForm: {}, // 点击查询按钮时生成的查询接口参数(ruleForm的copy)
      rules: {
        title: [{ required: true, message: '请输入标题' }],
        date: [{ required: true, message: '请选择起止日期' }],
        goal: [{ required: true, message: '请输入目标描述' }],
        standard: [{ required: true, message: '请输入衡量标准' }],
      },
    }
  },
  computed: {
    ...mapState('global', ['accessFlattenRoutes']),
    breadcrumbs() {
      return [{ name: '表单页', to: { name: 'form' } }]
    },
    pageTitle() {
      let curItem = this.accessFlattenRoutes.find(
        (item) => item.fullpath === this.$route.path
      )
      return curItem ? curItem.name : ''
    },
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
    },
  },
}
</script>
<style scoped>
.basic-list {
  .optional {
    font-style: normal;
    color: #909399;
  }
  .form-explain {
    color: #909399;
    line-height: 1.5;
  }
  ::v-deep {
    .section-content {
      padding: 0;
    }
    .el-form-item {
      margin-bottom: 22px;
      &__content {
        width: 50%;
      }
    }
    .el-button {
      padding: 10px 15px;
    }
    .item-public {
      .el-radio-group {
        line-height: inhert;
        .el-radio {
          margin-bottom: 0;
          line-height: inhert;
        }
      }
      .el-form-item__content {
        width: 100%;
      }
      .el-select {
        width: 100%;
      }
    }
  }
}
</style>
