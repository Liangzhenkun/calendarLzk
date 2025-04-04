const { DataTypes } = require('sequelize');

module.exports = {
  User: {
    tableName: 'user',
    attributes: {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      }
    }
  },
  
  Diary: {
    tableName: 'diary',
    attributes: {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        field: 'user_id'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      mood: {
        type: DataTypes.INTEGER,
        defaultValue: 3
      },
      weather: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(20),
        defaultValue: 'normal'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'date']
      }
    ]
  },

  DiaryTag: {
    tableName: 'diary_tags',
    attributes: {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      diary_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'diary',
          key: 'id'
        },
        field: 'diary_id'
      },
      tag_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      }
    }
  },

  DiaryLike: {
    tableName: 'diary_likes',
    attributes: {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      diary_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'diary',
          key: 'id'
        },
        field: 'diary_id'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        field: 'user_id'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['diary_id', 'user_id']
      }
    ]
  },

  DiaryComment: {
    tableName: 'diary_comments',
    attributes: {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      diary_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'diary',
          key: 'id'
        },
        field: 'diary_id'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        field: 'user_id'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      }
    }
  }
}; 