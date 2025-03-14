/**
 * 课程模型
 * 定义课程表结构和关联关系
 */
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    // 课程ID，主键
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // 课程标题
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    // 课程描述
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 课程封面图URL
    cover: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // 教师ID，外键
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 教学地点
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // 评估方案，JSON格式存储
    assessmentScheme: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [
        { name: '课堂', percentage: 30 },
        { name: '雨课堂课件', percentage: 20 },
        { name: '考试', percentage: 50 }
      ]
    }
  }, {
    // 表名
    tableName: 'courses',
    // 时间戳
    timestamps: true,
    // 创建和更新时间字段名
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // 关联关系
  Course.associate = (models) => {
    // 课程与教师的多对一关系
    Course.belongsTo(models.User, {
      foreignKey: 'teacherId',
      as: 'teacher'
    });

    // 课程与学生的多对多关系
    Course.belongsToMany(models.User, {
      through: 'CourseStudent',
      foreignKey: 'courseId',
      otherKey: 'studentId',
      as: 'students'
    });

    // 课程与公告的一对多关系
    Course.hasMany(models.Announcement, {
      foreignKey: 'courseId',
      as: 'announcements'
    });

    // 课程与作业/考试的一对多关系
    Course.hasMany(models.Exam, {
      foreignKey: 'courseId',
      as: 'exams'
    });

    // 课程与分组的一对多关系
    Course.hasMany(models.Group, {
      foreignKey: 'courseId',
      as: 'groups'
    });

    // 课程与资源的一对多关系
    Course.hasMany(models.Resource, {
      foreignKey: 'courseId',
      as: 'resources'
    });

    // 课程与课堂记录的一对多关系
    Course.hasMany(models.Record, {
      foreignKey: 'courseId',
      as: 'records'
    });
  };

  return Course;
}; 