import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error.message);
      } else {
        setProduct(data);
        setMainImage(data.image_urls ? data.image_urls[0] : "");
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAdding(true);
    const { error } = await supabase.from("cart").insert([
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: mainImage,
        quantity,
      },
    ]);

    if (error) {
      console.error("Error adding to cart:", error.message);
      alert("Failed to add to cart!");
    } else {
      alert("Added to cart!");
    }
    setAdding(false);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading product...</p>;
  if (!product) return <p style={{ textAlign: "center" }}>Product not found!</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "auto", textAlign: "center", padding: "20px", marginTop: "60px" }}>
      <h1>{product.name}</h1>
      
      {/* Main Image with Zoom Effect */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: "10px" }}>
        <img
          src={mainImage}
          alt={product.name}
          style={{ width: "400px", maxHeight: "400px", objectFit: "fill", transition: "transform 0.3s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      {/* Small Images */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", gap: "10px" }}>
        {product.image_urls?.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            style={{ width: "70px", height: "70px", borderRadius: "5px", cursor: "pointer", border: mainImage === img ? "2px solid #0070f3" : "none" }}
            onClick={() => setMainImage(img)}
          />
        ))}
      </div>

      <h2 style={{ color: "#0070f3" }}>${product.price}</h2>
      <p>{product.description || "No description available."}</p>
      
      {/* Quantity Selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}>
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: "5px 15px", fontSize: "18px", background: "#ddd", border: "none", cursor: "pointer" }}>-</button>
        <span style={{ padding: "0 15px", fontSize: "18px" }}>{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)} style={{ padding: "5px 15px", fontSize: "18px", background: "#ddd", border: "none", cursor: "pointer" }}>+</button>
      </div>

      {/* Buttons */}
      <button
        onClick={handleAddToCart}
        disabled={adding}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ff6600",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>

      <button
        onClick={() => router.push("/cart")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        View Cart
      </button>
    </div>
  );
}
