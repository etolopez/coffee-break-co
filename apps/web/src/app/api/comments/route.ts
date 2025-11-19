import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple logging function for development environment
 * In production, this should be replaced with Winston logger
 * 
 * @param level - Log level (info, warn, error, debug)
 * @param message - Log message
 * @param data - Optional data to log
 */
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
};

// In-memory storage for comments (in production, this would connect to a database)
let comments: any[] = [
  {
    id: '1',
    coffeeId: '1',
    customerId: 'customer_001',
    customerName: 'Sarah Johnson',
    rating: 5,
    comment: 'Absolutely love this Ethiopian coffee! The citrus notes are incredible and the floral aroma is divine. Will definitely order again.',
    createdAt: new Date('2024-12-01T10:30:00Z').toISOString()
  },
  {
    id: '2',
    coffeeId: '1',
    customerId: 'customer_002',
    customerName: 'Mike Chen',
    rating: 4,
    comment: 'Great coffee with a nice balance of flavors. The chocolate finish is smooth and satisfying.',
    createdAt: new Date('2024-12-02T14:15:00Z').toISOString()
  },
  {
    id: '3',
    coffeeId: '2',
    customerId: 'customer_003',
    customerName: 'Emily Rodriguez',
    rating: 5,
    comment: 'This Colombian coffee is exceptional! The berry notes are so vibrant and the honey sweetness is perfect.',
    createdAt: new Date('2024-12-03T09:45:00Z').toISOString()
  },
  {
    id: '4',
    coffeeId: '3',
    customerId: 'customer_004',
    customerName: 'David Kim',
    rating: 4,
    comment: 'High altitude coffee with great acidity. The chocolate undertones are subtle but nice.',
    createdAt: new Date('2024-12-04T11:20:00Z').toISOString()
  },
  {
    id: '5',
    coffeeId: '4',
    customerId: 'customer_005',
    customerName: 'Lisa Thompson',
    rating: 5,
    comment: 'Unique coastal coffee with amazing mineral notes. The citrus brightness is incredible!',
    createdAt: new Date('2024-12-05T15:30:00Z').toISOString()
  },
  {
    id: '6',
    coffeeId: '5',
    customerId: 'customer_006',
    customerName: 'James Wilson',
    rating: 4,
    comment: 'Traditional heritage coffee with rich body. Perfect for those who love full-bodied coffees.',
    createdAt: new Date('2024-12-06T09:15:00Z').toISOString()
  },
  {
    id: '7',
    coffeeId: '6',
    customerId: 'customer_007',
    customerName: 'Maria Garcia',
    rating: 4,
    comment: 'Great urban coffee with balanced flavors. The caramel sweetness is very approachable.',
    createdAt: new Date('2024-12-07T13:45:00Z').toISOString()
  },
  {
    id: '8',
    coffeeId: '7',
    customerId: 'customer_008',
    customerName: 'Robert Brown',
    rating: 5,
    comment: 'Exceptional high-altitude Colombian coffee. The floral notes and wine-like acidity are outstanding.',
    createdAt: new Date('2024-12-08T16:20:00Z').toISOString()
  },
  // Additional comments for new Premium Coffee Co. coffees
  {
    id: '9',
    coffeeId: '8',
    customerId: 'customer_009',
    customerName: 'Jennifer Lee',
    rating: 5,
    comment: 'Incredible Kenyan AA! The black currant and tomato notes are so unique and the complexity is outstanding.',
    createdAt: new Date('2024-12-09T12:00:00Z').toISOString()
  },
  {
    id: '10',
    coffeeId: '8',
    customerId: 'customer_010',
    customerName: 'Alex Martinez',
    rating: 4,
    comment: 'Great high-altitude coffee with bright acidity. The wine-like finish is very interesting.',
    createdAt: new Date('2024-12-10T14:30:00Z').toISOString()
  },
  {
    id: '11',
    coffeeId: '9',
    customerId: 'customer_011',
    customerName: 'Sophie Anderson',
    rating: 5,
    comment: 'This Panama Geisha is absolutely divine! The jasmine and bergamot notes are so delicate and beautiful.',
    createdAt: new Date('2024-12-11T10:15:00Z').toISOString()
  },
  {
    id: '12',
    coffeeId: '9',
    customerId: 'customer_012',
    customerName: 'Thomas Wright',
    rating: 5,
    comment: 'Worth every penny! The clean finish and incredible complexity make this a truly special coffee.',
    createdAt: new Date('2024-12-12T16:45:00Z').toISOString()
  },
  {
    id: '13',
    coffeeId: '9',
    customerId: 'customer_013',
    customerName: 'Emma Davis',
    rating: 4,
    comment: 'Beautiful coffee with exceptional clarity. The white tea notes are so unique and refreshing.',
    createdAt: new Date('2024-12-13T11:20:00Z').toISOString()
  },
  {
    id: '14',
    coffeeId: '10',
    customerId: 'customer_014',
    customerName: 'Michael Johnson',
    rating: 4,
    comment: 'Great Brazilian coffee with excellent body. The chocolate and nut notes are very satisfying.',
    createdAt: new Date('2024-12-14T13:10:00Z').toISOString()
  },
  {
    id: '15',
    coffeeId: '10',
    customerId: 'customer_015',
    customerName: 'Rachel Green',
    rating: 3,
    comment: 'Good coffee but a bit too low acidity for my taste. The body is nice though.',
    createdAt: new Date('2024-12-15T09:30:00Z').toISOString()
  },
  {
    id: '16',
    coffeeId: '11',
    customerId: 'customer_016',
    customerName: 'Daniel Kim',
    rating: 5,
    comment: 'Excellent Costa Rican coffee! The bright citrus and honey sweetness are perfectly balanced.',
    createdAt: new Date('2024-12-16T15:20:00Z').toISOString()
  },
  {
    id: '17',
    coffeeId: '11',
    customerId: 'customer_017',
    customerName: 'Amanda Wilson',
    rating: 4,
    comment: 'Very clean and bright coffee. Perfect for morning brewing and the honey notes are delightful.',
    createdAt: new Date('2024-12-17T08:45:00Z').toISOString()
  }
];

/**
 * GET /api/comments
 * Retrieves comments for a specific coffee entry or all comments
 * 
 * @param request - Next.js request object
 * @param request.url - Request URL with optional coffeeId query parameter
 * @returns JSON response with comments data or error message
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coffeeId = searchParams.get('coffeeId');
    
    log('info', `Fetching comments${coffeeId ? ` for coffee ID: ${coffeeId}` : ' (all comments)'}`);
    
    let filteredComments = comments;
    
    // Filter by coffee ID if provided
    if (coffeeId) {
      filteredComments = comments.filter(comment => comment.coffeeId === coffeeId);
      log('debug', `Filtered comments count: ${filteredComments.length}`);
    }
    
    // Sort by creation date (newest first)
    filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    log('info', `Successfully fetched ${filteredComments.length} comments`);
    
    return NextResponse.json({
      success: true,
      data: filteredComments,
      count: filteredComments.length
    });
  } catch (error) {
    log('error', 'Error fetching comments', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments
 * Creates a new comment for a coffee entry
 * Requires customer authentication (customerId in request body)
 * 
 * @param request - Next.js request object
 * @param request.body - Request body containing comment data
 * @param request.body.coffeeId - ID of the coffee entry to comment on
 * @param request.body.customerId - ID of the authenticated customer
 * @param request.body.customerName - Name of the customer leaving the comment
 * @param request.body.rating - Optional rating (1-5)
 * @param request.body.comment - The comment text
 * @returns JSON response with created comment data or error message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    log('info', 'Creating new comment', { coffeeId: body.coffeeId, customerId: body.customerId });
    
    // Validate required fields including customer authentication
    if (!body.coffeeId || !body.customerId || !body.customerName || !body.comment) {
      log('warn', 'Comment creation failed: missing required fields', body);
      return NextResponse.json(
        { success: false, error: 'Missing required fields: coffeeId, customerId, customerName, and comment are required' },
        { status: 400 }
      );
    }
    
    // Validate rating if provided (1-5)
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      log('warn', 'Comment creation failed: invalid rating', { rating: body.rating });
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Check if customer has already reviewed this coffee (one review per customer per coffee)
    const existingReview = comments.find(
      comment => comment.coffeeId === body.coffeeId && comment.customerId === body.customerId
    );
    
    if (existingReview) {
      log('warn', 'Comment creation failed: customer already reviewed this coffee', { 
        coffeeId: body.coffeeId, 
        customerId: body.customerId 
      });
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this coffee. You can only leave one review per coffee.' },
        { status: 409 }
      );
    }
    
    const newComment = {
      id: Date.now().toString(),
      coffeeId: body.coffeeId,
      customerId: body.customerId,
      customerName: body.customerName.trim(),
      rating: body.rating || null,
      comment: body.comment.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Add to comments array
    comments.unshift(newComment);
    
    log('info', 'Comment created successfully', { commentId: newComment.id, coffeeId: newComment.coffeeId, customerId: body.customerId });
    
    return NextResponse.json({
      success: true,
      data: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    log('error', 'Error creating comment', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments
 * Deletes a comment (admin functionality)
 * 
 * @param request - Next.js request object
 * @param request.url - Request URL with comment ID query parameter
 * @param request.url.searchParams.id - ID of the comment to delete
 * @returns JSON response with deleted comment data or error message
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    log('info', `Attempting to delete comment with ID: ${id}`);
    
    if (!id) {
      log('warn', 'Comment deletion failed: missing comment ID');
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    const commentIndex = comments.findIndex(comment => comment.id === id);
    if (commentIndex === -1) {
      log('warn', `Comment deletion failed: comment not found with ID: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    const deletedComment = comments.splice(commentIndex, 1)[0];
    
    log('info', 'Comment deleted successfully', { commentId: id, coffeeId: deletedComment.coffeeId });
    
    return NextResponse.json({
      success: true,
      data: deletedComment,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    log('error', 'Error deleting comment', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
