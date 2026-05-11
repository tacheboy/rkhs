# Detailed RKHS Study Notes — Based on *A Primer on Reproducing Kernel Hilbert Spaces*

## Overview

This document is a detailed synthesis of discussions on:

- Finite-dimensional RKHSs
- Infinite-dimensional RKHSs
- Function spaces
- Completion theory
- RKHS–kernel correspondence
- Continuity
- Interpolation
- Restriction of index sets
- Sum of kernels
- Geometric and topological intuition
- Detailed proofs and interpretations

Based primarily on:

> Jonathan H. Manton and Pierre-Olivier Amblard, *A Primer on Reproducing Kernel Hilbert Spaces*

---

# 1. Core Philosophy of RKHS

RKHS theory studies:

\[
\boxed{
\text{geometry of function spaces via kernels}
}
\]

A RKHS is not merely a function space.

It is:

- a Hilbert space,
- embedded in a larger function space,
- with continuous evaluation functionals.

The kernel encodes:

- geometry,
- topology,
- interpolation structure,
- smoothness,
- canonical coordinates.

---

# 2. Finite-Dimensional RKHSs

## 2.1 Kernel of an Inner Product Subspace

Given:

\[
V \subset \mathbb{R}^n
\]

with an inner product.

Goal:

Represent:
- the subspace,
- its orientation,
- its inner product,

canonically.

---

## Definition of Kernel

The kernel matrix:

\[
K = [k_1, \dots, k_n]
\]

is defined by:

\[
\langle v, k_i \rangle = e_i^T v
\]

for all \(v \in V\).

---

# Interpretation

The vector \(k_i\):

- extracts coordinate \(i\),
- represents the evaluation functional,
- acts as a gradient direction.

---

# Equivalent Definitions

## Definition 1

\[
\langle v, k_i \rangle = e_i^T v
\]

---

## Definition 2

If \(u_1,\dots,u_r\) is an orthonormal basis:

\[
K = \sum_{j=1}^r u_j u_j^T
\]

---

## Definition 3

\[
\langle k_j, k_i \rangle = K_{ij}
\]

and the \(k_i\) span \(V\).

---

# 3. Key Lemmas

## Lemma 2.1 — Existence and Uniqueness

There exists a unique kernel \(K\).

### Proof Idea

Define linear operator:

\[
L(k) = (\langle v_1,k\rangle,\dots,\langle v_r,k\rangle)
\]

Since:
- domain and codomain have same dimension,
- \(L\) is injective,

it is invertible.

Hence each \(k_i\) exists uniquely.

---

## Interpretation

This is a finite-dimensional version of the Riesz representation theorem.

---

## Lemma 2.2

If:
- the \(k_i\) span \(V\),
- \(\langle k_j,k_i\rangle = K_{ij}\),

then:

\[
\langle v,k_i\rangle = e_i^T v
\]

---

## Lemma 2.3

Reproducing property implies:
- spanning,
- Gram structure.

---

## Lemma 2.4

If:

\[
K = \sum u_i u_i^T
\]

then reproducing property holds.

---

## Lemma 2.5

For PSD matrices:

\[
\alpha^T K \alpha = 0
\Rightarrow
K\alpha = 0
\]

---

## Lemma 2.6

Every PSD matrix defines an RKHS geometry.

Define:

\[
\langle K\alpha, K\beta \rangle
=
\beta^T K \alpha
\]

---

## Lemma 2.7

Kernel uniquely determines:
- the space,
- the inner product.

---

# 4. Sequences of Inner Product Spaces

## Core Insight

Subspaces can converge via kernels.

Define:

\[
K_n \to K
\]

Then:

\[
V_n \to V
\]

---

# Example

\[
Q_n = \text{diag}(1,n^2)
\]

Then:

\[
K_n = Q_n^{-1}
=
\text{diag}(1,n^{-2})
\]

and:

\[
K_n \to
\begin{bmatrix}
1 & 0\\
0 & 0
\end{bmatrix}
\]

meaning the space collapses onto the x-axis.

---

# Interpretation

Degenerate inner products correspond to dimensional collapse.

RKHS handles such limits naturally.

---

# 5. Interpolation Geometry

## Problem

Find:

\[
x \in V
\]

such that:

\[
e_i^T x = 1
\]

with minimum norm.

---

# RKHS Solution

The solution is:

\[
x = \frac{k_i}{K_{ii}}
\]

---

# Interpretation

\(k_i\) is:
- the gradient direction,
- optimal interpolation direction.

---

# Geometric Meaning

The minimum norm solution moves orthogonally toward the constraint hyperplane.

---

# 6. Function Spaces

Function spaces:

\[
\mathbb{R}^X
\]

are vector spaces of functions.

---

# Important Point

Infinite-dimensional spaces behave differently from finite-dimensional spaces.

---

# Function Approximation

Approximation becomes projection geometry:

\[
f-g \perp V
\]

---

# Key Insight

Optimization becomes orthogonal projection.

---

# Example 3.2 — Failure of Projection

Space:

\[
\ell^2
\]

Subspace:
- finite-support sequences.

No optimal approximation exists.

---

# Reason

The subspace is not closed.

---

# Closedness

A subspace is closed if limits of convergent sequences remain inside it.

---

# Critical Insight

Orthogonal projection requires closedness.

---

# 7. Topological Aspects

Infinite-dimensional spaces introduce topology issues.

---

# Different Norms

Different norms induce different topologies.

Unlike finite dimensions, norms are not equivalent.

---

# Example

\[
\|x\|_2
\neq
\|x\|_\infty
\]

in induced convergence behavior.

---

# 8. Completion Theory

## Completion

A complete space contains limits of all Cauchy sequences.

---

# RKHS Motivation

Standard completion creates equivalence classes of sequences, not functions.

But RKHS needs actual functions.

---

# RKHS Completion

Suppose:

\[
V_0 \subset V \subset \mathbb{R}^X
\]

Then:

\[
f(x) = \lim_n f_n(x)
\]

for Cauchy sequences \(f_n\).

---

# Two Failure Modes

## Failure 1

Pointwise limits may not exist.

---

## Failure 2

Different sequences may produce same pointwise limit.

Equivalent to:

\[
\|f_n\| \not\to 0
\]

while:

\[
f_n(x)\to0
\]

pointwise.

---

# RKHS Fix

Evaluation functionals are continuous.

Thus:
- norm convergence controls pointwise convergence,
- pointwise representation is faithful.

---

# 9. Infinite-Dimensional RKHS

## Definition

A Hilbert space \(H \subset \mathbb{R}^X\) is a RKHS if:

\[
\forall x\in X,
\exists K(\cdot,x)\in H
\]

such that:

\[
f(x)=\langle f,K(\cdot,x)\rangle
\]

---

# Reproducing Property

Evaluation becomes inner product.

---

# Kernel Structure

\[
K(x,y)
=
\langle K(\cdot,y),K(\cdot,x)\rangle
\]

---

# Interpretation

Kernel measures similarity in feature space.

---

# 10. Continuity of RKHS Functions

## Proposition 4.2

Functions in RKHS are continuous iff:

1.

\[
x\mapsto K(x,y)
\]

is continuous for every \(y\),

and

2.

\[
K(y,y)
\]

is locally bounded.

---

# RKHS Inequality

\[
|f(x)|
\le
\|f\|\sqrt{K(x,x)}
\]

---

# Interpretation

Diagonal kernel values control function growth.

---

# Significance

Kernel geometry determines smoothness.

---

# 11. Invertibility of Kernel Matrices

Given points:

\[
x_1,\dots,x_r
\]

define:

\[
A_{ij}=K(x_i,x_j)
\]

---

# PSD Property

\[
\sum_{ij} c_i c_j K(x_i,x_j)
=
\left\|
\sum_i c_i K(\cdot,x_i)
\right\|^2
\]

---

# Singular Matrix Meaning

If:

\[
Ac=0
\]

then:

\[
\sum_i c_i K(\cdot,x_i)=0
\]

---

# Consequence

\[
\sum_i c_i f(x_i)=0
\]

for all \(f\in H\).

---

# Interpretation

The RKHS cannot distinguish those sample points.

---

# Importance

Invertibility guarantees:
- interpolation,
- uniqueness,
- stable learning.

---

# 12. Restriction of Index Sets

Suppose:

\[
X' \subset X
\]

Restrict functions to \(X'\).

---

# Problem

Different functions may collapse to same restriction.

---

# RKHS Norm

Define:

\[
\|f\|'=
\inf_{g|_{X'}=f}
\|g\|
\]

---

# Interpretation

Choose minimal-energy extension.

---

# Significance

Restriction induces quotient geometry.

---

# 13. Sum of Kernels

If:

\[
K = K_1 + K_2
\]

then \(K\) is again a kernel.

---

# Corresponding RKHS

\[
H = H_1 + H_2
\]

---

# Norm

\[
\|f\|^2
=
\inf_{f=f_1+f_2}
(
\|f_1\|_1^2+\|f_2\|_2^2
)
\]

---

# Interpretation

Function decomposes optimally into geometric components.

---

# Applications

- additive kernels,
- Gaussian processes,
- multi-scale modeling,
- ANOVA kernels.

---

# 14. RKHS–Kernel Correspondence

## From RKHS to Kernel

Riesz representation gives:

\[
f(x)=\langle f,K(\cdot,x)\rangle
\]

---

## From Kernel to RKHS

Construct:

\[
f=\sum_i c_i K(\cdot,x_i)
\]

with inner product:

\[
\langle f,g\rangle
=
\sum_{ij} c_i d_j K(x_i,y_j)
\]

Then complete the space.

---

# Ultimate Insight

The kernel already contains:
- geometry,
- topology,
- interpolation structure,
- basis functions.

---

# 15. Canonical Coordinates vs Pointwise Coordinates

RKHS has two coordinate systems.

---

## Pointwise Coordinates

\[
f(x)
\]

Extrinsic.

---

## Canonical Coordinates

\[
f=\sum_i \alpha_i K(\cdot,x_i)
\]

Intrinsic.

---

# Importance

Pointwise coordinates:
- help take limits.

Canonical coordinates:
- respect geometry.

---

# 16. Geometric Philosophy of RKHS

RKHS theory studies extrinsic geometry.

---

# Key Idea

Kernel representation changes continuously with changing geometry.

Unlike orthonormal bases.

---

# Why Important

Optimization solutions vary continuously with geometry.

Thus:

\[
\text{subspace}
\to
\text{kernel}
\to
\text{solution}
\]

---

# 17. Final Grand Summary

RKHSs are Hilbert spaces engineered to preserve:
- evaluation,
- continuity,
- interpolation,
- geometric structure,
- stability.

The kernel simultaneously encodes:
- coordinates,
- geometry,
- similarity,
- topology.

---

# Ultimate Interpretation

\[
\boxed{
\text{RKHS theory is geometry-by-kernel}
}
\]

and

\[
\boxed{
\text{Kernel = implicit encoding of a Hilbert space}
}
\]
