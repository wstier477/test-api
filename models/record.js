/**
 * 课堂记录模型
 * 定义课堂记录表结构和关联关系
 */
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    // 记录ID，主键
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // 记录标题
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    // 上课日期
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    // 开始时间
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    // 结束时间
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    // 课堂内容
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 出勤率
    attendanceRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
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
    // 创建者ID，外键
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    // 表名
    tableName: 'records',
    // 时间戳
    timestamps: true,
    // 创建和更新时间字段名
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // 关联关系
  Record.associate = (models) => {
    // 课堂记录与课程的多对一关系
    Record.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // 课堂记录与创建者的多对一关系
    Record.belongsTo(models.User, {
      foreignKey: 'creatorId',
      as: 'creator'
    });
  };

  return Record;
}; 