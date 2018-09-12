# competence pro

## 用户权限:

- staff权限:普通员工权限,只能CRUD自己的data,但不能修改user

- leader权限:部门领导权限,CRUD部门内所有people的data和user数据

- boss权限:CRUD所有,用户创建后level不可修改
	

## 关键字段

- _id: objectID的string字段(统一用string)
- peo: people
- name: 昵称
- user :user
- level: user的权限等级(分成staff,leader和boss)
- usern: username用户名
- last : last-login,用户上次登录的时间
- pass: password(明文/密文)
- role_id: role的_id
- rowList: 存储所有的row对象
- skill_id: row对象的skill的_id
- my_tar: my target 个人对于某个skill的目标
- real : real/actual data
- act: action行动,string,四选一
- act_sta: action status,string,四选一
- act_de: action detail, string,大文本框
- comm: comment评论,大文本框
- role: role
- tarList: role的target list,存放对应所有skill的taregt(number)
- dept: department部门
- skill skill技能
- type: skill的type分类,string
- desc: description描述一个skill,大string
- attr: attribute,skill的属性,common或者specific
- curr: current对象,当前聚焦的对象(比如人,role,skill,row)
- dom: window.dom:存放所有dom对象的对象
- edi: editor编辑器框架
- innerEdi: 子编辑器

## 命名规范

统一命名规范灰常重要,无论是在html中,css中,js中还是数据库中都要有统一的变量/对象命名规范,从而节约时间,提高效率.命名既不能太长也不能太短:太长会降低开发效率,臃肿,增加存储空间;太短的话容易引起命名冲突还降低了语义性.通常在1~5个字符的单词不要缩写,直接全称;当超过5个字符的单词一定要缩减,但是规则有差异,如果业界对某个长单词有默契的缩写那就直接采用比如attribute缩成attr,如果没有的话可以采用单词的第一个音节,比如people缩成peo,如果首音节不可取或者引起了其他方面的不合适,可以用多个音节的首字母,比如config缩成cfg,package缩成pkg;最后,还可以直接取单词的前4/5个字符,比如username缩成usern,当然,如果是个复合型单词,比如password可以缩成pass,如果是多个单词组成的字段有两种方式:下划线或者驼峰命名,比如peoList和peo_name.以上这么多,最重要的是5字符原则,其他的选择主要靠直觉,哦对了,方法名,文件名,甚至临时棉量那不需要缩写.


## 接口规范

一句话,无论是前后端json交互,还是后端与数据库交互(listener和model的交互)的数据传递都遵循面向对象的原则:能封装成对象尽可能的封装,比如peo对象,role对象,skill对象,row对象.此外,函数的参数列表如果有多个字段,就直接封装成对象,因为字典比数组好记

## MVVM

利用js的proxy实现对curr对象的子成员的监听,及时刷新ui层的数据显示,如果dom原生支持mvvm就好了

## 使用说明

### login
http://10.88.33.124/
http://naaslxrgedcom01.bsh.corp.bshg.com/
用户名:邮箱(大小写不敏感),密码:邮箱(小写,敏感),用户名和密码均可修改
session缓存7天,免登陆

### grid & radar

ag-grid enterprise 提供丰富的接口和功能,结合我的脚本,一起实现了:sort,pin,group,filter,drag & drop,aggregation等,具体看演示;可根据skill或者type来绘制雷达图

### people / role <==> skill / type



## 优化 & 展望

- 浏览器缓存30天(public目录)
- session缓存7天
- browser detect ,杜绝IE后患
- 登陆日志,修改日志
- 数据库备份,防手抖
- 帮助wiki,最好英文视频演示
- root后台管理界面(权限管理,日志查看)