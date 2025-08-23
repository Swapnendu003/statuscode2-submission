const { Data } = require('../models/userData');

exports.getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    

    const total = await Data.countDocuments();
    const users = await Data.find()
      .select('customerId name email age gender location creditScore balance estimatedSalary')
      .limit(limit)
      .skip(skip)
      .sort({ customerId: 1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching users'
    });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await Data.findOne({ customerId: req.params.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user'
    });
  }
};
