using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Util;
using Microsoft.AspNetCore.Mvc;

namespace ShipmentService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShippingController : ControllerBase
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName = "shipments";

        public ShippingController(IAmazonS3 s3Client)
        {
            _s3Client = s3Client;
        }

        [HttpPost("manifest")]
        public async Task<IActionResult> CreateManifest([FromBody] dynamic manifestData)
        {
            var manifestId = Guid.NewGuid().ToString();
            var content = manifestData?.ToString() ?? "Sample Manifest";

            try
            {
                // Ensure bucket exists
                if (!await AmazonS3Util.DoesS3BucketExistV2Async(_s3Client, _bucketName))
                {
                    await _s3Client.PutBucketAsync(_bucketName);
                }

                var putRequest = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = $"manifest-{manifestId}.json",
                    ContentBody = content
                };

                await _s3Client.PutObjectAsync(putRequest);

                return Ok(new { 
                    message = "Shipping manifest created", 
                    id = manifestId,
                    storage = "MinIO (S3 Compatible)" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "S3 Storage failed", details = ex.Message });
            }
        }
    }
}
