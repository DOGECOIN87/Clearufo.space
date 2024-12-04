import * as tf from '@tensorflow/tfjs'
import * as faceDetection from '@tensorflow-models/face-detection'

let model: faceDetection.FaceDetector | null = null
let isLoading = false
let loadPromise: Promise<faceDetection.FaceDetector> | null = null

export const loadFaceDetectionModel = async () => {
  if (model) return model
  
  // If already loading, return the existing promise
  if (loadPromise) return loadPromise

  // Create a new loading promise
  loadPromise = (async () => {
    try {
      isLoading = true
      await tf.ready()
      await tf.setBackend('webgl')
      
      const detector = faceDetection.SupportedModels.MediaPipeFaceDetector
      model = await faceDetection.createDetector(detector, {
        runtime: 'tfjs',
        modelType: 'short',  // Use 'short' for better performance
        maxFaces: 5,
      })
      
      return model
    } finally {
      isLoading = false
      loadPromise = null
    }
  })()

  return loadPromise
}

export const detectFaces = async (video: HTMLVideoElement) => {
  if (!model) {
    model = await loadFaceDetectionModel()
  }
  
  if (!model) {
    throw new Error('Face detection model failed to load')
  }

  try {
    const faces = await model.estimateFaces(video, {
      flipHorizontal: false
    })
    return faces
  } catch (error) {
    console.error('Face detection error:', error)
    throw error
  }
}

export const drawFaceDetections = (
  ctx: CanvasRenderingContext2D,
  detections: faceDetection.Face[]
) => {
  ctx.save()
  ctx.scale(1, 1) // Ensure correct scaling

  // Set styles for the detection boxes
  ctx.strokeStyle = '#00ff00'
  ctx.lineWidth = 3
  ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
  ctx.font = '16px Arial'

  detections.forEach(detection => {
    const box = detection.box
    const score = detection.score || 0

    // Draw box
    ctx.strokeRect(box.xMin, box.yMin, box.width, box.height)
    ctx.fillRect(box.xMin, box.yMin, box.width, box.height)

    // Draw confidence score
    ctx.fillStyle = '#00ff00'
    ctx.fillText(
      `${Math.round(score * 100)}%`,
      box.xMin,
      box.yMin - 5
    )

    // Draw keypoints if available
    if (detection.keypoints) {
      detection.keypoints.forEach(keypoint => {
        ctx.beginPath()
        ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI)
        ctx.fillStyle = '#ff0000'
        ctx.fill()
      })
    }
  })

  ctx.restore()
}