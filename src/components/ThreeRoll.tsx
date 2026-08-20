'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ThreeRoll() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Ensure no duplicate canvases exist
    containerRef.current.innerHTML = ''

    const width = containerRef.current.clientWidth || 360
    const height = containerRef.current.clientHeight || 360

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0.5, 4.5)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)

    // Master Group
    const rollGroup = new THREE.Group()
    rollGroup.position.set(0, -0.1, 0)
    rollGroup.rotation.set(0.3, -0.4, 0.5) // appetizing 3D isometric tilt
    scene.add(rollGroup)

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Procedural Texture for Golden-Brown Flaky Paratha
    // ─────────────────────────────────────────────────────────────────────────
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Golden base
      const grad = ctx.createLinearGradient(0, 0, 512, 512)
      grad.addColorStop(0, '#F3C583')
      grad.addColorStop(0.3, '#E5A958')
      grad.addColorStop(0.7, '#D48B38')
      grad.addColorStop(1, '#EBB56B')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 512, 512)

      // Roasted char spots (tandoor flecks)
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 512
        const r = 2 + Math.random() * 9
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(110, 50, 15, 0.65)' : 'rgba(70, 25, 5, 0.75)'
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Paratha layer flaky lines
      for (let i = 0; i < 15; i++) {
        const y = Math.random() * 512
        ctx.strokeStyle = 'rgba(140, 70, 20, 0.3)'
        ctx.lineWidth = 2 + Math.random() * 3
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(150, y - 20, 350, y + 20, 512, y)
        ctx.stroke()
      }
    }
    const parathaTex = new THREE.CanvasTexture(canvas)

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Paratha Outer Wrap
    // ─────────────────────────────────────────────────────────────────────────
    const parathaGeo = new THREE.CylinderGeometry(0.75, 0.7, 2.8, 36, 1, true)
    const parathaMat = new THREE.MeshStandardMaterial({
      map: parathaTex,
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })
    const parathaMesh = new THREE.Mesh(parathaGeo, parathaMat)
    rollGroup.add(parathaMesh)

    // Spiral Fold seam line on paratha
    const seamGeo = new THREE.TorusGeometry(0.76, 0.03, 8, 32, Math.PI * 1.5)
    const seamMat = new THREE.MeshStandardMaterial({ color: 0x9c5922, roughness: 0.8 })
    const seamMesh = new THREE.Mesh(seamGeo, seamMat)
    seamMesh.rotation.x = Math.PI / 2.3
    seamMesh.position.y = 0.4
    rollGroup.add(seamMesh)

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Lower Parchment Paper Wrap (Authentic Food-grade wrap)
    // ─────────────────────────────────────────────────────────────────────────
    const paperGeo = new THREE.CylinderGeometry(0.78, 0.73, 1.4, 32)
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0x22092C,
      roughness: 0.4,
      metalness: 0.1,
    })
    const paperMesh = new THREE.Mesh(paperGeo, paperMat)
    paperMesh.position.y = -0.75
    rollGroup.add(paperMesh)

    // Foil / Coral brand band around the paper
    const bandGeo = new THREE.CylinderGeometry(0.79, 0.76, 0.35, 32)
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xF05941,
      roughness: 0.3,
      metalness: 0.3,
    })
    const bandMesh = new THREE.Mesh(bandGeo, bandMat)
    bandMesh.position.y = -0.45
    rollGroup.add(bandMesh)

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Gourmet Fillings Popping Out of Top (Tikka, Paneer, Onions, Herbs)
    // ─────────────────────────────────────────────────────────────────────────
    const fillingGroup = new THREE.Group()
    fillingGroup.position.y = 1.3
    rollGroup.add(fillingGroup)

    // A. Charcoal Tikka Chunks (Red-orange glazed)
    const tikkaMat = new THREE.MeshStandardMaterial({
      color: 0xBE3144,
      roughness: 0.35,
      metalness: 0.1,
    })
    const tikkaGeo = new THREE.DodecahedronGeometry(0.22, 0)
    for (let i = 0; i < 6; i++) {
      const tikka = new THREE.Mesh(tikkaGeo, tikkaMat)
      const angle = (i / 6) * Math.PI * 2
      const radius = 0.25 + Math.random() * 0.2
      tikka.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 0.25 + 0.1,
        Math.sin(angle) * radius
      )
      tikka.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      tikka.scale.set(1 + Math.random() * 0.4, 0.8 + Math.random() * 0.4, 1 + Math.random() * 0.3)
      fillingGroup.add(tikka)
    }

    // B. Paneer / Malai Cubes (Creamy off-white with charred edges)
    const paneerMat = new THREE.MeshStandardMaterial({
      color: 0xFFF2D8,
      roughness: 0.5,
    })
    const paneerGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25)
    for (let i = 0; i < 4; i++) {
      const paneer = new THREE.Mesh(paneerGeo, paneerMat)
      const angle = (i / 4) * Math.PI * 2 + 0.5
      paneer.position.set(Math.cos(angle) * 0.3, (Math.random() - 0.5) * 0.2 + 0.15, Math.sin(angle) * 0.3)
      paneer.rotation.set(Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5)
      fillingGroup.add(paneer)
    }

    // C. Pickled Purple Red Onion Rings
    const onionMat = new THREE.MeshStandardMaterial({
      color: 0x9B2246,
      roughness: 0.3,
      side: THREE.DoubleSide,
    })
    const onionGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 20)
    for (let i = 0; i < 4; i++) {
      const onion = new THREE.Mesh(onionGeo, onionMat)
      onion.position.set(
        (Math.random() - 0.5) * 0.6,
        0.15 + Math.random() * 0.25,
        (Math.random() - 0.5) * 0.6
      )
      onion.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      fillingGroup.add(onion)
    }

    // D. Fresh Mint & Coriander Leaves (Vibrant Green)
    const herbMat = new THREE.MeshStandardMaterial({
      color: 0x22C55E,
      roughness: 0.4,
      side: THREE.DoubleSide,
    })
    const herbGeo = new THREE.SphereGeometry(0.09, 6, 6)
    for (let i = 0; i < 12; i++) {
      const herb = new THREE.Mesh(herbGeo, herbMat)
      herb.position.set(
        (Math.random() - 0.5) * 0.75,
        0.1 + Math.random() * 0.35,
        (Math.random() - 0.5) * 0.75
      )
      herb.scale.set(1.2, 0.2, 0.8)
      herb.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      fillingGroup.add(herb)
    }

    // E. Sweet Corn Kernels
    const cornMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.2 })
    const cornGeo = new THREE.SphereGeometry(0.06, 8, 8)
    for (let i = 0; i < 6; i++) {
      const corn = new THREE.Mesh(cornGeo, cornMat)
      corn.position.set(
        (Math.random() - 0.5) * 0.6,
        0.15 + Math.random() * 0.2,
        (Math.random() - 0.5) * 0.6
      )
      fillingGroup.add(corn)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Floating Spice / Aromatic Sparkle Particles
    // ─────────────────────────────────────────────────────────────────────────
    const particleCount = 25
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 2.5
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xF05941,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    })
    const particleSystem = new THREE.Points(particleGeo, particleMat)
    scene.add(particleSystem)

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Professional Studio Lighting
    // ─────────────────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xF05941, 3.5)
    keyLight.position.set(4, 5, 4)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 2.5)
    rimLight.position.set(-4, -2, -3)
    scene.add(rimLight)

    const fillLight = new THREE.PointLight(0xFFE8D6, 2, 10)
    fillLight.position.set(0, 3, 2)
    scene.add(fillLight)

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Interactive Drag-to-Rotate & Smooth Floating Animation
    // ─────────────────────────────────────────────────────────────────────────
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let targetRotY = -0.4
    let targetRotX = 0.3

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      prevMouseX = clientX
      prevMouseY = clientY
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const deltaX = clientX - prevMouseX
      const deltaY = clientY - prevMouseY
      targetRotY += deltaX * 0.008
      targetRotX += deltaY * 0.008
      prevMouseX = clientX
      prevMouseY = clientY
    }

    const onPointerUp = () => {
      isDragging = false
    }

    const el = renderer.domElement
    el.addEventListener('mousedown', onPointerDown)
    el.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)
    el.addEventListener('touchstart', onPointerDown)
    el.addEventListener('touchmove', onPointerMove)
    window.addEventListener('touchend', onPointerUp)

    let reqId: number
    let clock = new THREE.Clock()

    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      if (!isDragging) {
        targetRotY += 0.008 // gentle auto rotation
      }

      // Smooth damping
      rollGroup.rotation.y += (targetRotY - rollGroup.rotation.y) * 0.08
      rollGroup.rotation.x += (targetRotX - rollGroup.rotation.x) * 0.08

      // Gentle floating bob
      rollGroup.position.y = -0.1 + Math.sin(elapsedTime * 1.5) * 0.08

      // Slowly float particles
      particleSystem.rotation.y = elapsedTime * 0.05

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mouseup', onPointerUp)
      window.removeEventListener('touchend', onPointerUp)
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center" />
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-[#F5F1EF]/70 font-black px-3 py-1 rounded-full bg-[#22092C]/80 backdrop-blur-sm border border-white/10 shadow">
          ✦ Drag to rotate 3D Gourmet Roll ✦
        </span>
      </div>
    </div>
  )
}
