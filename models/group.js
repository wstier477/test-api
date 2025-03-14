/**
 * 分组模型
 * 定义分组表结构和关联关系
 */
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    // 分组ID，主键
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // 分组名称
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    // 课程ID，外键
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    // 描述
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    // 表名
    tableName: 'groups',
    // 时间戳
    timestamps: true,
    // 创建和更新时间字段名
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // 关联关系
  Group.associate = (models) => {
    // 分组与课程的多对一关系
    Group.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // 分组与学生的多对多关系
    Group.belongsToMany(models.User, {
      through: 'GroupStudent',
      foreignKey: 'groupId',
      otherKey: 'studentId',
      as: 'students'
    });
  };

  return Group;
}; 