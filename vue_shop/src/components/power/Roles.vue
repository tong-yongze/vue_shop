<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表 </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for 循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :class="[i3 === 0 ? '' : 'bdtop']"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <pre> {{ scope.row }}</pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="compileRole(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeCompileById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        ref="addFormRef"
        :model="addform"
        :rules="addFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="compileVisible" width="50%">
      <el-form
        :model="compileForm"
        :rules="compileFormRules"
        ref="compileFormRef"
        label-width="70px"
        @click="compileClosed"
      >
        <el-form-item label="角色ID">
          <el-input v-model="compileForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="compileForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="compileForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="compileVisible = false">取 消</el-button>
        <el-button type="primary" @click="compileInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制添加角色对话框的显示与隐藏
      addVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],

      //树型控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 控制编辑角色对话框的显示与隐藏
      compileVisible: false,
      // 查询到编辑角色id
      compileForm: {},
      // 添加角色表单对象
      addform: {
        roleName: '',
        roleDesc: '',
      },
      // 添加表单验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名的长度在3-10个字符之间',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色描述的长度在3-10个字符之间',
            trigger: 'blur',
          },
        ],
      },
      // 编辑角色的规则对象
      compileFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名的长度在3-10个字符之间',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色描述的长度在3-10个字符之间',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return $message.error('获取角色列表失败')
      }
      this.rolelist = res.data
      // console.log(this.rolelist)
    },
    // 添加角色对话框的显示或隐藏
    addRoles() {
      this.addVisible = true
    },
    // 监听添加角色对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加新角色
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return
        // 可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles/', this.addform)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 隐藏添加角色的对话框
        this.addVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },

    // 展开编辑角色的对话框
    async compileRole(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑角色信息失败')
      }
      this.compileForm = res.data
      this.compileVisible = true
    },
    // 监听编辑角色对话框的关闭事件
    compileClosed() {
      this.$refs.compileFormRef.resetFields()
    },
    // 修改用户信息并提交
    compileInfo() {
      this.$refs.compileFormRef.validate(async (valid) => {
        // console.log(valid)
        console.log(this.compileForm.roleId)
        console.log(this.$refs.compileFormRef)
        if (!valid) return
        // 发起编辑角色的请求
        const { data: res } = await this.$http.put(
          'roles/' + this.compileForm.roleId,
          {
            roleName: this.compileForm.roleName,
            roleDesc: this.compileForm.roleDesc,
          }
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑角色失败')
        }
        // 关闭对话框
        this.compileVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('编辑角色成功')
      })
    },
    // 根据id删除对应的角色
    async removeCompileById(id) {
      // 弹框询问是否删除
      const comfirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((error) => error) // 捕获用户的取消行为
      if (comfirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // console.log('已确认删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getRolesList()
    },
    // 根据Id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((error) => error)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }

      // this.getRolesList()  会重新获取数据 页面就会被刷新
      role.children = res.data // 返回的data, 是当前角色下最新的权限数据
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }

      // 把获取到的权限数据保存到data中
      this.rightslist = res.data
      console.log(this.rightslist)

      // 递归获取三级节点的 id
      this.getLeafkeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式 获取角色下三级权限的id  并保存到 defKeys 数组
    getLeafkeys(node, arr) {
      // 如果当前 node 节点不包含children 属性  则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafkeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // console.log(keys)  打印可以拿到所有选中的权限
      const idStr = keys.join()

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>